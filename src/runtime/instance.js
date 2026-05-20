import { id, addonType } from "../../config.caw.js";
import AddonTypeMap from "../../template/addonTypeMap.js";

const MANAGER_PLUGIN_ID = "salmanshh_DHTN_manager";

const TIER_UNAWARE = 0;
const TIER_SUSPICIOUS = 1;
const TIER_ALERTED = 2;
const TIER_COMBAT = 3;

const COORD_DEFAULT_UPDATE_INTERVAL_SEC = 0.1;
const COORD_DEFAULT_MAX_SQUADS_PER_UPDATE = 0;
const COORD_DEFAULT_TIME_SLICE_SEC = 0;
const COORD_DEFAULT_SLOT_TTL_SEC = 1;
const COORD_DEFAULT_AUTO_RELEASE_ON_DEREGISTER = true;

const COORD = {
  agentsByUid: new Map(),
  squadsById: new Map(),
  dirtySquads: new Set(),
  lastUpdateSec: 0,
  updateIntervalSec: COORD_DEFAULT_UPDATE_INTERVAL_SEC,
  maxSquadsPerUpdate: COORD_DEFAULT_MAX_SQUADS_PER_UPDATE,
  timeSliceSec: COORD_DEFAULT_TIME_SLICE_SEC,
  slotDefaultTtlSec: COORD_DEFAULT_SLOT_TTL_SEC,
  autoReleaseOnDeregister: COORD_DEFAULT_AUTO_RELEASE_ON_DEREGISTER,
  coordinationEnabled: true,
  passesThisTick: 0,
  expiredSlotsReleased: 0,
};

export default function (parentClass) {
  return class extends parentClass {
    constructor() {
      super();
      // 0: agentType 1: planningMode 2: planningIntervalSec 3: urgencyThreshold
      // 4: initialAlertLevel 5: taskTimeoutSec 6: autoRegister 7: enabled 8: debugLabel
      const properties = this._getInitProperties();

      this._agentType = String(properties[0] ?? "default");
      this._planningMode = String(properties[1] ?? "hybrid");
      this._planningIntervalSec = Math.max(0, Number(properties[2] ?? 1));
      this._urgencyThreshold = Math.max(
        0,
        Math.min(1, Number(properties[3] ?? 0.55))
      );
      this._alertLevel = Math.max(0, Math.min(1, Number(properties[4] ?? 0)));
      this._taskTimeoutSec = Math.max(0, Number(properties[5] ?? 0));
      this._autoRegister = !!properties[6];
      this._isEnabled = !!properties[7];
      this._debugLabel = String(properties[8] ?? "");

      this._manager = null;
      this._warnedMissingManager = false;
      this._isRegistered = false;
      this._isPaused = false;

      this._planTimer = 0;
      this._taskTimer = 0;
      this._pendingUrgency = 0;
      this._replanDirty = false;

      this._currentTask = "";
      this._previousTask = "";
      this._completedTask = "";
      this._failedTask = "";
      this._restoredTask = "";

      this._stimulusType = "";
      this._stimulusX = 0;
      this._stimulusY = 0;
      this._stimulusIntensity = 0;

      this._alertTier = TIER_UNAWARE;
      this._previousTier = TIER_UNAWARE;

      this._isInTemporaryTask = false;
      this._temporaryTaskId = "";
      this._temporaryDurationSec = 0;
      this._temporaryTimer = 0;
      this._temporarySnapshotTask = "";

      this._squadId = "";
      this._isSquadLeader = false;
      this._assignedSlots = new Map();
      this._coordinationDirty = false;
      this._lastCoordinationUpdateSec = 0;

      this._coordLastSquadId = "";
      this._coordLastAgentUID = 0;
      this._coordLastSlotType = "";
      this._coordLastSlotId = "";

      this._slotBuilderSquadId = "";
      this._slotBuilderSlotType = "";
      this._slotBuilderSlots = [];

      this._taskNetworkBuilderId = "";
      this._taskNetworkBuilderTasks = [];

      this.events = {};

      this._setTicking(true);
    }

    _trigger(method) {
      this.dispatch(method);
      super._trigger(self.C3[AddonTypeMap[addonType]][id].Cnds[method]);
    }

    onCreate() {
      this._planTimer = 0;
      this._taskTimer = 0;
      this._pendingUrgency = 0;
      this._replanDirty = true;

      if (this._autoRegister) {
        this._registerWithManager();
      }

      this._registerCoordinationAgent();
    }

    on(tag, callback, options) {
      if (!this.events[tag]) {
        this.events[tag] = [];
      }
      this.events[tag].push({ callback, options });
    }

    off(tag, callback) {
      if (this.events[tag]) {
        this.events[tag] = this.events[tag].filter(
          (event) => event.callback !== callback
        );
      }
    }

    dispatch(tag) {
      if (this.events[tag]) {
        this.events[tag].forEach((event) => {
          if (event.options && event.options.params) {
            const fn = self.C3[AddonTypeMap[addonType]][id].Cnds[tag];
            if (fn && !fn.call(this, ...event.options.params)) {
              return;
            }
          }
          event.callback();
          if (event.options && event.options.once) {
            this.off(tag, event.callback);
          }
        });
      }
    }

    _tick() {
      const dt = this.runtime.dt;
      if (!this._isEnabled) {
        return;
      }

      if (this._isPaused) {
        return;
      }

      if (!this._manager) {
        this._manager = this._findManager();
      }

      if (!this._manager) {
        if (!this._warnedMissingManager) {
          this._warnedMissingManager = true;
          this._log("TactiCore manager not found; behavior is suspended.");
        }
        return;
      }

      this._pollManagerState();
      this._updateTaskTimeout(dt);
      this._updateTemporaryTask(dt);
      this._updatePlanning(dt);
      this._updateCoordination();
    }

    _nowSec() {
      return Date.now() / 1000;
    }

    _registerCoordinationAgent() {
      const uid = this._uid();
      if (uid <= 0) {
        return;
      }
      COORD.agentsByUid.set(uid, this);
    }

    _deregisterCoordinationAgent() {
      const uid = this._uid();
      if (uid <= 0) {
        return;
      }

      if (COORD.autoReleaseOnDeregister) {
        this._removeAgentFromSquad(uid);
      }

      COORD.agentsByUid.delete(uid);
    }

    _getAgentByUID(uid) {
      return COORD.agentsByUid.get(Math.floor(Number(uid) || 0)) || null;
    }

    _normalizeSquadId(squadId) {
      return String(squadId ?? "").trim();
    }

    _getOrCreateSquad(squadId) {
      const sid = this._normalizeSquadId(squadId);
      if (!sid) {
        return null;
      }

      let squad = COORD.squadsById.get(sid);
      if (!squad) {
        squad = {
          squadId: sid,
          leaderUID: 0,
          state: new Map(),
          members: [],
          slots: new Map(),
          dirty: true,
        };
        COORD.squadsById.set(sid, squad);
      }
      return squad;
    }

    _markSquadDirty(squadId) {
      const sid = this._normalizeSquadId(squadId);
      if (!sid) {
        return;
      }

      COORD.dirtySquads.add(sid);
      const squad = COORD.squadsById.get(sid);
      if (squad) {
        squad.dirty = true;
      }
    }

    _toSquadWorldKey(key) {
      const raw = String(key ?? "").trim();
      if (!raw) {
        return "";
      }
      if (raw.startsWith("squad.")) {
        return raw;
      }
      return `squad.${raw}`;
    }

    _setWorldStateValueForUID(uid, key, value) {
      this._callManager("_setWorldStateValue", [uid, key, value]);
    }

    _getWorldStateValueForUID(uid, key, fallback = 0) {
      return this._getManagerValue("_getWorldStateValue", [uid, key], fallback);
    }

    _requestPlanForUID(uid) {
      this._callManager("_requestPlan", [uid]);
    }

    _triggerCoordination(method, squadId = "", agentUID = 0, slotType = "", slotId = "") {
      this._coordLastSquadId = String(squadId ?? "");
      this._coordLastAgentUID = Math.floor(Number(agentUID) || 0);
      this._coordLastSlotType = String(slotType ?? "");
      this._coordLastSlotId = String(slotId ?? "");
      this._trigger(method);
    }

    _syncAgentSquadWorldState(agent, squad) {
      const uid = agent?._uid?.() ?? 0;
      if (uid <= 0) {
        return;
      }

      this._setWorldStateValueForUID(uid, "squad.id", squad?.squadId || "");
      const role = squad && squad.leaderUID === uid ? "leader" : "member";
      this._setWorldStateValueForUID(uid, "squad.role", squad ? role : "");

      if (!squad) {
        return;
      }

      for (const [k, v] of squad.state.entries()) {
        this._setWorldStateValueForUID(uid, this._toSquadWorldKey(k), v);
      }

      for (const [slotType, slotId] of agent._assignedSlots.entries()) {
        this._setWorldStateValueForUID(uid, this._toSquadWorldKey(slotType), slotId);
      }
    }

    _promoteSquadLeaderIfNeeded(squad) {
      if (!squad || squad.members.length === 0) {
        if (squad) {
          squad.leaderUID = 0;
        }
        return;
      }

      if (squad.members.includes(squad.leaderUID)) {
        return;
      }

      squad.members.sort((a, b) => a - b);
      squad.leaderUID = squad.members[0] || 0;
    }

    _updateLeaderFlags(squad) {
      if (!squad) {
        return;
      }

      for (const uid of squad.members) {
        const member = this._getAgentByUID(uid);
        if (!member) {
          continue;
        }
        member._isSquadLeader = uid === squad.leaderUID;
        this._syncAgentSquadWorldState(member, squad);
      }
    }

    _releaseOwnedSlotsInSquad(squad, ownerUID) {
      if (!squad) {
        return;
      }

      for (const [slotType, slotMap] of squad.slots.entries()) {
        for (const [slotId, slotRecord] of slotMap.entries()) {
          if (slotRecord.ownerUID !== ownerUID) {
            continue;
          }
          slotRecord.ownerUID = 0;
          slotRecord.reservedAtSec = 0;
          slotRecord.expiresAtSec = 0;
          this._triggerCoordination("OnSlotReleased", squad.squadId, ownerUID, slotType, slotId);
        }
      }
    }

    _findSquadIdByAgentUID(agentUID) {
      const uid = Math.floor(Number(agentUID) || 0);
      const agent = this._getAgentByUID(uid);
      if (agent && agent._squadId) {
        return agent._squadId;
      }

      for (const [squadId, squad] of COORD.squadsById.entries()) {
        if (squad.members.includes(uid)) {
          return squadId;
        }
      }

      return "";
    }

    _assignAgentToSquad(agentUID, squadId) {
      const uid = Math.floor(Number(agentUID) || 0);
      const sid = this._normalizeSquadId(squadId);
      if (uid <= 0 || !sid) {
        return false;
      }

      const agent = this._getAgentByUID(uid);
      if (!agent) {
        return false;
      }

      if (agent._squadId === sid) {
        return true;
      }

      if (agent._squadId) {
        this._removeAgentFromSquad(uid);
      }

      const squad = this._getOrCreateSquad(sid);
      if (!squad) {
        return false;
      }

      if (!squad.members.includes(uid)) {
        squad.members.push(uid);
        squad.members.sort((a, b) => a - b);
      }

      if (!squad.leaderUID) {
        squad.leaderUID = uid;
      }

      agent._squadId = sid;
      agent._coordinationDirty = true;
      agent._lastCoordinationUpdateSec = this._nowSec();
      agent._isSquadLeader = uid === squad.leaderUID;

      this._markSquadDirty(sid);
      this._updateLeaderFlags(squad);
      this._triggerCoordination("OnSquadMembershipChanged", sid, uid);
      this._invalidateSquadPlans(sid);
      return true;
    }

    _removeAgentFromSquad(agentUID) {
      const uid = Math.floor(Number(agentUID) || 0);
      if (uid <= 0) {
        return false;
      }

      const sid = this._findSquadIdByAgentUID(uid);
      if (!sid) {
        return false;
      }

      const squad = COORD.squadsById.get(sid);
      if (!squad) {
        return false;
      }

      squad.members = squad.members.filter((n) => n !== uid);
      this._releaseOwnedSlotsInSquad(squad, uid);

      const agent = this._getAgentByUID(uid);
      if (agent) {
        agent._squadId = "";
        agent._isSquadLeader = false;
        agent._coordinationDirty = true;
        agent._assignedSlots.clear();
        this._syncAgentSquadWorldState(agent, null);
      }

      if (squad.members.length === 0) {
        COORD.squadsById.delete(sid);
      } else {
        this._promoteSquadLeaderIfNeeded(squad);
        this._updateLeaderFlags(squad);
        this._markSquadDirty(sid);
      }

      this._triggerCoordination("OnSquadMembershipChanged", sid, uid);
      this._invalidateSquadPlans(sid);
      return true;
    }

    _setSquadLeader(squadId, agentUID) {
      const sid = this._normalizeSquadId(squadId);
      const uid = Math.floor(Number(agentUID) || 0);
      if (!sid || uid <= 0) {
        return false;
      }

      const squad = this._getOrCreateSquad(sid);
      if (!squad) {
        return false;
      }

      if (!squad.members.includes(uid)) {
        const assigned = this._assignAgentToSquad(uid, sid);
        if (!assigned) {
          return false;
        }
      }

      squad.leaderUID = uid;
      this._markSquadDirty(sid);
      this._updateLeaderFlags(squad);
      this._triggerCoordination("OnSquadMembershipChanged", sid, uid);
      this._invalidateSquadPlans(sid);
      return true;
    }

    _setSquadStateKey(squadId, key, value) {
      const sid = this._normalizeSquadId(squadId);
      const rawKey = String(key ?? "").trim();
      if (!sid || !rawKey) {
        return false;
      }

      const squad = this._getOrCreateSquad(sid);
      if (!squad) {
        return false;
      }

      const previous = squad.state.get(rawKey);
      if (previous === value) {
        return true;
      }

      squad.state.set(rawKey, value);
      const worldKey = this._toSquadWorldKey(rawKey);
      for (const uid of squad.members) {
        this._setWorldStateValueForUID(uid, worldKey, value);
      }

      this._markSquadDirty(sid);
      this._triggerCoordination("OnSquadStateChanged", sid, 0);
      this._invalidateSquadPlans(sid);
      return true;
    }

    _clearSquadStateKey(squadId, key) {
      const sid = this._normalizeSquadId(squadId);
      const rawKey = String(key ?? "").trim();
      if (!sid || !rawKey) {
        return false;
      }

      const squad = COORD.squadsById.get(sid);
      if (!squad) {
        return false;
      }

      squad.state.delete(rawKey);
      const worldKey = this._toSquadWorldKey(rawKey);
      for (const uid of squad.members) {
        this._setWorldStateValueForUID(uid, worldKey, null);
      }

      this._markSquadDirty(sid);
      this._triggerCoordination("OnSquadStateChanged", sid, 0);
      this._invalidateSquadPlans(sid);
      return true;
    }

    _getSlotMap(squad, slotType, createIfMissing = false) {
      const st = String(slotType ?? "").trim();
      if (!squad || !st) {
        return null;
      }

      let slotMap = squad.slots.get(st);
      if (!slotMap && createIfMissing) {
        slotMap = new Map();
        squad.slots.set(st, slotMap);
      }
      return slotMap || null;
    }

    _getOrCreateSlotRecord(slotMap, slotId) {
      const sid = String(slotId ?? "").trim();
      if (!slotMap || !sid) {
        return null;
      }

      let rec = slotMap.get(sid);
      if (!rec) {
        rec = {
          ownerUID: 0,
          reservedAtSec: 0,
          expiresAtSec: 0,
          metadata: null,
          x: 0,
          y: 0,
          hasPos: false,
        };
        slotMap.set(sid, rec);
      }
      return rec;
    }

    _isSlotExpired(slotRecord, nowSec) {
      if (!slotRecord || slotRecord.ownerUID === 0) {
        return true;
      }
      if (slotRecord.expiresAtSec <= 0) {
        return false;
      }
      return slotRecord.expiresAtSec <= nowSec;
    }

    _reserveSlot(squadId, slotType, slotId, agentUID, ttlSec) {
      const sid = this._normalizeSquadId(squadId);
      const st = String(slotType ?? "").trim();
      const slotName = String(slotId ?? "").trim();
      const uid = Math.floor(Number(agentUID) || 0);
      const ttl = Number(ttlSec) > 0 ? Number(ttlSec) : COORD.slotDefaultTtlSec;
      if (!sid || !st || !slotName || uid <= 0) {
        return false;
      }

      const squad = this._getOrCreateSquad(sid);
      if (!squad) {
        return false;
      }

      if (!squad.members.includes(uid)) {
        const ok = this._assignAgentToSquad(uid, sid);
        if (!ok) {
          return false;
        }
      }

      const now = this._nowSec();
      const slotMap = this._getSlotMap(squad, st, true);
      const rec = this._getOrCreateSlotRecord(slotMap, slotName);
      if (!rec) {
        return false;
      }

      if (rec.ownerUID !== 0 && rec.ownerUID !== uid && !this._isSlotExpired(rec, now)) {
        return false;
      }

      const previousOwnerUID = rec.ownerUID;
      rec.ownerUID = uid;
      rec.reservedAtSec = now;
      rec.expiresAtSec = ttl > 0 ? now + ttl : 0;

      const owner = this._getAgentByUID(uid);
      if (owner) {
        owner._assignedSlots.set(st, slotName);
        this._setWorldStateValueForUID(uid, this._toSquadWorldKey(st), slotName);
      }

      if (previousOwnerUID && previousOwnerUID !== uid) {
        const previousOwner = this._getAgentByUID(previousOwnerUID);
        if (previousOwner && previousOwner._assignedSlots.get(st) === slotName) {
          previousOwner._assignedSlots.delete(st);
          this._setWorldStateValueForUID(previousOwnerUID, this._toSquadWorldKey(st), null);
        }
      }

      this._markSquadDirty(sid);
      this._triggerCoordination("OnSlotReserved", sid, uid, st, slotName);
      this._invalidateSquadPlans(sid);
      return true;
    }

    _releaseSlot(squadId, slotType, slotId) {
      const sid = this._normalizeSquadId(squadId);
      const st = String(slotType ?? "").trim();
      const slotName = String(slotId ?? "").trim();
      if (!sid || !st || !slotName) {
        return false;
      }

      const squad = COORD.squadsById.get(sid);
      if (!squad) {
        return true;
      }

      const slotMap = this._getSlotMap(squad, st, false);
      if (!slotMap) {
        return true;
      }

      const rec = slotMap.get(slotName);
      if (!rec) {
        return true;
      }

      const oldOwnerUID = rec.ownerUID;
      rec.ownerUID = 0;
      rec.reservedAtSec = 0;
      rec.expiresAtSec = 0;

      if (oldOwnerUID) {
        const owner = this._getAgentByUID(oldOwnerUID);
        if (owner && owner._assignedSlots.get(st) === slotName) {
          owner._assignedSlots.delete(st);
          this._setWorldStateValueForUID(oldOwnerUID, this._toSquadWorldKey(st), null);
        }
      }

      this._markSquadDirty(sid);
      this._triggerCoordination("OnSlotReleased", sid, oldOwnerUID, st, slotName);
      this._invalidateSquadPlans(sid);
      return true;
    }

    _setSlotPosition(squadId, slotType, slotId, x, y) {
      const sid = this._normalizeSquadId(squadId);
      const st = String(slotType ?? "").trim();
      const slotName = String(slotId ?? "").trim();
      if (!sid || !st || !slotName) {
        return false;
      }

      const squad = this._getOrCreateSquad(sid);
      if (!squad) {
        return false;
      }

      const slotMap = this._getSlotMap(squad, st, true);
      const rec = this._getOrCreateSlotRecord(slotMap, slotName);
      if (!rec) {
        return false;
      }

      rec.x = Number(x) || 0;
      rec.y = Number(y) || 0;
      rec.hasPos = true;
      return true;
    }

    _loadSlotPositionsFromJSON(squadId, slotType, slotsJson) {
      const raw = String(slotsJson ?? "").trim();
      if (!raw) {
        return false;
      }

      let items = null;
      try {
        items = JSON.parse(raw);
      } catch {
        return false;
      }

      if (!Array.isArray(items)) {
        return false;
      }

      let loaded = 0;
      for (const item of items) {
        if (!item || typeof item !== "object") {
          continue;
        }

        const slotId = String(item.slotId ?? item.id ?? "").trim();
        if (!slotId) {
          continue;
        }

        const x = Number(item.x);
        const y = Number(item.y);
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
          continue;
        }

        if (this._setSlotPosition(squadId, slotType, slotId, x, y)) {
          loaded += 1;
        }
      }

      return loaded > 0;
    }

    _loadSlotPositionsFromWorldStateKey(squadId, slotType, scope, key, agentUID) {
      const scopeRaw = String(scope ?? "").trim().toLowerCase();
      const worldKey = String(key ?? "").trim();
      if (!worldKey) {
        return false;
      }

      const uid = Math.floor(Number(agentUID) || this._uid());
      let sourceUID = uid;
      if (scopeRaw === "this" || scopeRaw === "local" || scopeRaw === "instance") {
        sourceUID = this._uid();
      }

      const jsonString = this._getWorldStateValueForUID(sourceUID, worldKey, "");
      if (typeof jsonString !== "string") {
        return false;
      }
      return this._loadSlotPositionsFromJSON(squadId, slotType, jsonString);
    }

    _autoAssignNearestFreeSlot(
      agentUID,
      squadId,
      slotType,
      agentX,
      agentY,
      maxDistance,
      ttlSec
    ) {
      const sid = this._normalizeSquadId(squadId);
      const st = String(slotType ?? "").trim();
      const uid = Math.floor(Number(agentUID) || 0);
      if (!sid || !st || uid <= 0) {
        return false;
      }

      const squad = COORD.squadsById.get(sid);
      if (!squad) {
        return false;
      }

      const slotMap = this._getSlotMap(squad, st, false);
      if (!slotMap) {
        return false;
      }

      const x = Number(agentX) || 0;
      const y = Number(agentY) || 0;
      const maxDist = Number(maxDistance) || 0;
      const now = this._nowSec();

      const candidates = [];
      for (const [slotId, rec] of slotMap.entries()) {
        if (!rec.hasPos) {
          continue;
        }

        const isAvailable =
          rec.ownerUID === 0 || rec.ownerUID === uid || this._isSlotExpired(rec, now);
        if (!isAvailable) {
          continue;
        }

        const dx = rec.x - x;
        const dy = rec.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (maxDist > 0 && dist > maxDist) {
          continue;
        }

        candidates.push({ slotId, dist });
      }

      if (candidates.length === 0) {
        return false;
      }

      candidates.sort((a, b) => {
        if (a.dist !== b.dist) {
          return a.dist - b.dist;
        }
        return a.slotId.localeCompare(b.slotId);
      });

      return this._reserveSlot(sid, st, candidates[0].slotId, uid, ttlSec);
    }

    _invalidateSquadPlans(squadId) {
      const sid = this._normalizeSquadId(squadId);
      if (!sid) {
        return false;
      }
      this._markSquadDirty(sid);
      return true;
    }

    _requestSquadPlans(squadId) {
      const sid = this._normalizeSquadId(squadId);
      if (!sid) {
        return false;
      }

      const squad = COORD.squadsById.get(sid);
      if (!squad) {
        return false;
      }

      for (const uid of squad.members) {
        this._requestPlanForUID(uid);
      }
      squad.dirty = false;
      COORD.dirtySquads.delete(sid);
      return true;
    }

    _processCoordinationSquad(squad, nowSec) {
      if (!squad) {
        return;
      }

      for (const [slotType, slotMap] of squad.slots.entries()) {
        for (const [slotId, rec] of slotMap.entries()) {
          if (rec.ownerUID === 0 || !this._isSlotExpired(rec, nowSec)) {
            continue;
          }

          const oldOwnerUID = rec.ownerUID;
          rec.ownerUID = 0;
          rec.reservedAtSec = 0;
          rec.expiresAtSec = 0;
          COORD.expiredSlotsReleased += 1;

          if (oldOwnerUID) {
            const owner = this._getAgentByUID(oldOwnerUID);
            if (owner && owner._assignedSlots.get(slotType) === slotId) {
              owner._assignedSlots.delete(slotType);
              this._setWorldStateValueForUID(
                oldOwnerUID,
                this._toSquadWorldKey(slotType),
                null
              );
            }
          }

          this._triggerCoordination(
            "OnSlotReleased",
            squad.squadId,
            oldOwnerUID,
            slotType,
            slotId
          );
          squad.dirty = true;
        }
      }

      if (squad.dirty || COORD.dirtySquads.has(squad.squadId)) {
        this._requestSquadPlans(squad.squadId);
      }
    }

    _updateCoordination() {
      if (!COORD.coordinationEnabled || COORD.squadsById.size === 0) {
        return;
      }

      const now = this._nowSec();
      if (now - COORD.lastUpdateSec < COORD.updateIntervalSec) {
        return;
      }

      COORD.lastUpdateSec = now;
      COORD.passesThisTick = 0;
      const startSec = now;

      const squadIds = [...COORD.squadsById.keys()].sort((a, b) => a.localeCompare(b));
      const maxSquads = COORD.maxSquadsPerUpdate;
      const mustProcessAtLeastOne = squadIds.length > 0;

      for (const squadId of squadIds) {
        if (maxSquads > 0 && COORD.passesThisTick >= maxSquads) {
          break;
        }

        if (
          COORD.timeSliceSec > 0 &&
          COORD.passesThisTick > 0 &&
          this._nowSec() - startSec >= COORD.timeSliceSec
        ) {
          break;
        }

        const squad = COORD.squadsById.get(squadId);
        this._processCoordinationSquad(squad, now);
        COORD.passesThisTick += 1;
      }

      if (mustProcessAtLeastOne && COORD.passesThisTick === 0) {
        const first = COORD.squadsById.get(squadIds[0]);
        this._processCoordinationSquad(first, now);
        COORD.passesThisTick = 1;
      }
    }

    _initializeSlotBuilder(squadId, slotType) {
      const sid = this._normalizeSquadId(squadId);
      const st = String(slotType ?? "").trim();
      if (!sid || !st) {
        return;
      }
      this._slotBuilderSquadId = sid;
      this._slotBuilderSlotType = st;
      this._slotBuilderSlots = [];
    }

    _addSlotToBuilder(squadId, slotType, slotId, x, y) {
      const sid = this._normalizeSquadId(squadId);
      const st = String(slotType ?? "").trim();
      const slId = String(slotId ?? "").trim();
      if (!sid || !st || !slId || sid !== this._slotBuilderSquadId || st !== this._slotBuilderSlotType) {
        return;
      }
      this._slotBuilderSlots.push({
        slotId: slId,
        x: Number(x) || 0,
        y: Number(y) || 0,
      });
    }

    _loadSlotSetFromBuilder(squadId, slotType) {
      const sid = this._normalizeSquadId(squadId);
      const st = String(slotType ?? "").trim();
      if (!sid || !st || sid !== this._slotBuilderSquadId || st !== this._slotBuilderSlotType) {
        return;
      }
      if (this._slotBuilderSlots.length === 0) {
        return;
      }
      const squad = this._getOrCreateSquad(sid);
      if (!squad) {
        return;
      }
      if (!squad.slots.has(st)) {
        squad.slots.set(st, new Map());
      }
      const slotsOfType = squad.slots.get(st);
      for (const slot of this._slotBuilderSlots) {
        slotsOfType.set(slot.slotId, {
          slotId: slot.slotId,
          x: slot.x,
          y: slot.y,
          ownedBy: 0,
          expiresAt: 0,
        });
      }
      this._markSquadDirty(sid);
      this._slotBuilderSquadId = "";
      this._slotBuilderSlotType = "";
      this._slotBuilderSlots = [];
    }

    _initializeTaskNetworkBuilder(networkId) {
      const nid = String(networkId ?? "").trim();
      if (!nid) {
        return;
      }
      this._taskNetworkBuilderId = nid;
      this._taskNetworkBuilderTasks = [];
    }

    _addTaskToNetworkBuilder(taskId, networkId, description, taskType) {
      const nid = String(networkId ?? "").trim();
      const tid = String(taskId ?? "").trim();
      const desc = String(description ?? "").trim();
      const ttype = String(taskType ?? "primitive").trim();
      if (!nid || !tid || nid !== this._taskNetworkBuilderId) {
        return;
      }
      this._taskNetworkBuilderTasks.push({
        taskId: tid,
        description: desc,
        taskType: ttype,
      });
    }

    _loadTaskNetworkFromBuilder(networkId, exportKey) {
      const nid = String(networkId ?? "").trim();
      const ek = String(exportKey ?? "").trim();
      if (!nid || !ek || nid !== this._taskNetworkBuilderId) {
        return;
      }
      if (this._taskNetworkBuilderTasks.length === 0) {
        return;
      }
      const networkObj = {
        networkId: nid,
        tasks: this._taskNetworkBuilderTasks.map((t) => ({
          id: t.taskId,
          description: t.description,
          type: t.taskType,
        })),
        createdAt: new Date().toISOString(),
        version: "1.0",
      };
      const jsonStr = JSON.stringify(networkObj);
      this._setWorldState(ek, jsonStr);
      this._taskNetworkBuilderId = "";
      this._taskNetworkBuilderTasks = [];
    }

    _updatePlanning(dt) {
      if (this._planningMode === "reactive") {
        if (this._replanDirty) {
          this._requestPlan();
        }
        return;
      }

      if (this._planningMode === "hybrid" && this._replanDirty) {
        if (this._pendingUrgency >= this._urgencyThreshold) {
          this._requestPlan();
          return;
        }
      }

      this._planTimer += dt;
      if (this._planTimer >= this._planningIntervalSec) {
        this._requestPlan();
      }
    }

    _updateTaskTimeout(dt) {
      if (this._taskTimeoutSec <= 0) {
        return;
      }

      const task = this.CurrentTask();
      if (!task) {
        this._taskTimer = 0;
        return;
      }

      this._taskTimer += dt;
      if (this._taskTimer >= this._taskTimeoutSec) {
        this._markTaskFailed();
      }
    }

    _updateTemporaryTask(dt) {
      if (!this._isInTemporaryTask || this._temporaryDurationSec <= 0) {
        return;
      }

      this._temporaryTimer += dt;
      if (this._temporaryTimer >= this._temporaryDurationSec) {
        this._endTemporaryTask();
      }
    }

    _pollManagerState() {
      const task = this._getManagerValue("_getActiveTask", [this._uid()], "") || "";
      if (!this._isInTemporaryTask && task !== this._currentTask) {
        this._previousTask = this._currentTask;
        this._currentTask = String(task);
        this._taskTimer = 0;
        if (this._currentTask) {
          this._trigger("OnTaskStarted");
        }
      }

      const alert = Number(
        this._getManagerValue("_getAlertLevel", [this._uid()], this._alertLevel)
      );
      this._setAlertLevel(alert);
    }

    _setAlertLevel(alertLevel) {
      this._alertLevel = Math.max(0, Math.min(1, Number(alertLevel) || 0));
      const tier = this._toAlertTier(this._alertLevel);
      if (tier !== this._alertTier) {
        this._previousTier = this._alertTier;
        this._alertTier = tier;
        this._trigger("OnAlertChanged");
      }
    }

    _toAlertTier(level) {
      if (level >= 0.75) {
        return TIER_COMBAT;
      }
      if (level >= 0.5) {
        return TIER_ALERTED;
      }
      if (level >= 0.25) {
        return TIER_SUSPICIOUS;
      }
      return TIER_UNAWARE;
    }

    _uid() {
      return this.instance?.uid ?? -1;
    }

    _findManager() {
      const objectType = this.runtime.objects?.[MANAGER_PLUGIN_ID];
      if (!objectType || typeof objectType.getFirstInstance !== "function") {
        return null;
      }
      return objectType.getFirstInstance() || null;
    }

    _ensureManager() {
      if (!this._manager) {
        this._manager = this._findManager();
      }
      return this._manager;
    }

    _registerWithManager() {
      const manager = this._ensureManager();
      if (!manager) {
        return;
      }

      this._callManager("_registerAgent", [
        this._uid(),
        this._agentType,
        this._alertLevel,
      ]);
      this._isRegistered = true;
      this._replanDirty = true;
    }

    _deregisterFromManager() {
      if (!this._manager || !this._isRegistered) {
        return;
      }

      this._callManager("_deregisterAgent", [this._uid()]);
      this._isRegistered = false;
    }

    _requestPlan() {
      this._callManager("_requestPlan", [this._uid()]);
      this._planTimer = 0;
      this._pendingUrgency = 0;
      this._replanDirty = false;
    }

    _markTaskComplete() {
      if (this._isInTemporaryTask) {
        this._endTemporaryTask();
        return;
      }

      const current = this.CurrentTask();
      this._completedTask = current;
      this._callManager("_markTaskComplete", [this._uid()]);
      this._taskTimer = 0;
      this._trigger("OnTaskCompleted");
      this._replanDirty = true;
    }

    _markTaskFailed() {
      const current = this.CurrentTask();
      this._failedTask = current;

      if (this._isInTemporaryTask) {
        this._endTemporaryTask();
      }

      this._callManager("_markTaskFailed", [this._uid()]);
      this._taskTimer = 0;
      this._trigger("OnTaskFailed");
      this._replanDirty = true;
    }

    _pushTemporaryTask(taskId, durationSec) {
      const cleanedTask = String(taskId ?? "").trim();
      if (!cleanedTask) {
        return;
      }

      this._temporarySnapshotTask = this.CurrentTask();
      this._temporaryTaskId = cleanedTask;
      this._temporaryDurationSec = Math.max(0, Number(durationSec) || 0);
      this._temporaryTimer = 0;
      this._isInTemporaryTask = true;

      this._previousTask = this._currentTask;
      this._currentTask = cleanedTask;
      this._taskTimer = 0;

      this._trigger("OnTemporaryTaskStarted");
      this._trigger("OnTaskStarted");
    }

    _endTemporaryTask() {
      if (!this._isInTemporaryTask) {
        return;
      }

      this._isInTemporaryTask = false;
      this._restoredTask = this._temporarySnapshotTask;
      this._temporaryTaskId = "";
      this._temporaryDurationSec = 0;
      this._temporaryTimer = 0;
      this._temporarySnapshotTask = "";
      this._taskTimer = 0;

      this._currentTask = this._restoredTask;
      this._trigger("OnTemporaryTaskEnded");
      this._requestPlan();
    }

    _setWorldStateValue(key, value) {
      this._callManager("_setWorldStateValue", [this._uid(), key, value]);
      this._replanDirty = true;
    }

    _clearWorldStateKey(key) {
      this._setWorldStateValue(key, null);
    }

    _getWorldStateValue(key, fallback = 0) {
      return this._getManagerValue(
        "_getWorldStateValue",
        [this._uid(), key],
        fallback
      );
    }

    _addStimulus(type, intensity, x, y, extraJson = "") {
      const safeIntensity = Math.max(0, Math.min(1, Number(intensity) || 0));
      const sx = Number(x) || 0;
      const sy = Number(y) || 0;
      this._callManager("_addStimulus", [
        this._uid(),
        String(type),
        safeIntensity,
        sx,
        sy,
        extraJson,
      ]);

      this._stimulusType = String(type);
      this._stimulusX = sx;
      this._stimulusY = sy;
      this._stimulusIntensity = safeIntensity;
      this._trigger("OnStimulusReceived");

      this._pendingUrgency = Math.max(this._pendingUrgency, safeIntensity);
      this._replanDirty = true;
    }

    _callManager(method, args) {
      const manager = this._ensureManager();
      if (!manager || typeof manager[method] !== "function") {
        return undefined;
      }
      return manager[method](...args);
    }

    _getManagerValue(method, args, fallbackValue) {
      const value = this._callManager(method, args);
      return value === undefined || value === null ? fallbackValue : value;
    }

    _tierName(tier) {
      switch (tier) {
        case TIER_SUSPICIOUS:
          return "suspicious";
        case TIER_ALERTED:
          return "alerted";
        case TIER_COMBAT:
          return "combat";
        default:
          return "unaware";
      }
    }

    _log(message) {
      if (!this._debugLabel) {
        console.warn(`[${id}] ${message}`);
        return;
      }
      console.warn(`[${id}][${this._debugLabel}] ${message}`);
    }

    _release() {
      this._deregisterCoordinationAgent();
      this._deregisterFromManager();
      super._release();
    }

    _saveToJson() {
      return {
        agentType: this._agentType,
        planningMode: this._planningMode,
        planningIntervalSec: this._planningIntervalSec,
        urgencyThreshold: this._urgencyThreshold,
        alertLevel: this._alertLevel,
        taskTimeoutSec: this._taskTimeoutSec,
        autoRegister: this._autoRegister,
        isEnabled: this._isEnabled,
        debugLabel: this._debugLabel,
        isPaused: this._isPaused,
        currentTask: this._currentTask,
        previousTask: this._previousTask,
        completedTask: this._completedTask,
        failedTask: this._failedTask,
        restoredTask: this._restoredTask,
        squadId: this._squadId,
        isSquadLeader: this._isSquadLeader,
        assignedSlots: [...this._assignedSlots.entries()],
        coordinationDirty: this._coordinationDirty,
        lastCoordinationUpdateSec: this._lastCoordinationUpdateSec,
      };
    }

    _loadFromJson(o) {
      this._agentType = String(o.agentType ?? this._agentType);
      this._planningMode = String(o.planningMode ?? this._planningMode);
      this._planningIntervalSec = Math.max(
        0,
        Number(o.planningIntervalSec ?? this._planningIntervalSec)
      );
      this._urgencyThreshold = Math.max(
        0,
        Math.min(1, Number(o.urgencyThreshold ?? this._urgencyThreshold))
      );
      this._alertLevel = Math.max(0, Math.min(1, Number(o.alertLevel ?? 0)));
      this._taskTimeoutSec = Math.max(
        0,
        Number(o.taskTimeoutSec ?? this._taskTimeoutSec)
      );
      this._autoRegister = !!(o.autoRegister ?? this._autoRegister);
      this._isEnabled = !!(o.isEnabled ?? this._isEnabled);
      this._debugLabel = String(o.debugLabel ?? this._debugLabel);
      this._isPaused = !!o.isPaused;
      this._currentTask = String(o.currentTask ?? "");
      this._previousTask = String(o.previousTask ?? "");
      this._completedTask = String(o.completedTask ?? "");
      this._failedTask = String(o.failedTask ?? "");
      this._restoredTask = String(o.restoredTask ?? "");
      this._squadId = String(o.squadId ?? "");
      this._isSquadLeader = !!o.isSquadLeader;
      this._assignedSlots = new Map(Array.isArray(o.assignedSlots) ? o.assignedSlots : []);
      this._coordinationDirty = !!o.coordinationDirty;
      this._lastCoordinationUpdateSec = Number(o.lastCoordinationUpdateSec) || 0;

      this._alertTier = this._toAlertTier(this._alertLevel);
      this._previousTier = this._alertTier;
    }

    // Internal action logic (called by ACE-exposed actions)
    _setAgentType(agentType) {
      this._agentType = String(agentType ?? "default").trim() || "default";
      this._requestPlan();
    }

    _setPlanningMode(mode) {
      const value = String(mode ?? "hybrid").trim().toLowerCase();
      if (value === "reactive" || value === "deliberate" || value === "hybrid") {
        this._planningMode = value;
      }
    }

    _setPlanningInterval(seconds) {
      this._planningIntervalSec = Math.max(0, Number(seconds) || 0);
      this._planTimer = 0;
    }

    _setTaskTimeout(seconds) {
      this._taskTimeoutSec = Math.max(0, Number(seconds) || 0);
      this._taskTimer = 0;
    }

    _setEnabled(enabled) {
      this._isEnabled = !!enabled;
      if (!this._isEnabled) {
        this._isPaused = false;
      } else {
        this._requestPlan();
      }
    }

    _setProcessingInterval(seconds) {
      this._setPlanningInterval(seconds);
    }

    _setWorldState(key, value) {
      this._setWorldStateValue(String(key ?? ""), value);
    }

    _setPatrolPoint(index, x, y) {
      const i = Math.floor(Number(index) || 0);
      this._setWorldStateValue(`patrolPoint_${i}_x`, Number(x) || 0);
      this._setWorldStateValue(`patrolPoint_${i}_y`, Number(y) || 0);
    }

    _setTarget(targetUID, x, y) {
      this._setWorldStateValue("targetUID", Number(targetUID) || 0);
      this._setWorldStateValue("targetX", Number(x) || 0);
      this._setWorldStateValue("targetY", Number(y) || 0);
      this._setWorldStateValue("targetVisible", 1);
    }

    _clearTarget() {
      this._setWorldStateValue("targetUID", 0);
      this._setWorldStateValue("targetX", 0);
      this._setWorldStateValue("targetY", 0);
      this._setWorldStateValue("targetVisible", 0);
    }

    _signalTargetSeen(targetUID, x, y, confidence) {
      const tx = Number(x) || 0;
      const ty = Number(y) || 0;
      this._setWorldStateValue("targetUID", Number(targetUID) || 0);
      this._setWorldStateValue("targetX", tx);
      this._setWorldStateValue("targetY", ty);
      this._setWorldStateValue("targetVisible", 1);
      this._setWorldStateValue("lastKnownX", tx);
      this._setWorldStateValue("lastKnownY", ty);
      this._addStimulus("visual", Number(confidence) || 0, tx, ty, "");
    }

    _signalTargetLost() {
      this._setWorldStateValue("targetVisible", 0);
    }

    _signalSoundHeard(x, y, intensity) {
      const sx = Number(x) || 0;
      const sy = Number(y) || 0;
      const i = Number(intensity) || 0;
      this._setWorldStateValue("lastSoundX", sx);
      this._setWorldStateValue("lastSoundY", sy);
      this._setWorldStateValue("lastSoundIntensity", i);
      this._addStimulus("audio", i, sx, sy, "");
    }

    _signalDamaged(damage, fromX, fromY) {
      const d = Math.max(0, Number(damage) || 0);
      const x = Number(fromX) || 0;
      const y = Number(fromY) || 0;
      const currentHealth = Number(this._getWorldStateValue("health", 100)) || 100;
      this._setWorldStateValue("health", Math.max(0, currentHealth - d));
      this._setWorldStateValue("lastDamageX", x);
      this._setWorldStateValue("lastDamageY", y);

      const intensity = Math.max(0, Math.min(1, d / 100));
      this._addStimulus("damage", intensity, x, y, "");
      this._requestPlan();
    }

    _pause() {
      this._isPaused = true;
    }

    _resume() {
      this._isPaused = false;
      this._requestPlan();
    }

    _setSlotReservation(mode, squadId, slotType, slotId, agentUID, ttlSec) {
      const m = String(mode ?? "reserve").trim().toLowerCase();
      if (m === "release" || m === "0") {
        this._releaseSlot(squadId, slotType, slotId);
        return;
      }
      this._reserveSlot(squadId, slotType, slotId, agentUID, ttlSec);
    }

    _squadPlanControl(mode, squadId) {
      const m = String(mode ?? "request").trim().toLowerCase();
      if (m === "invalidate") {
        this._invalidateSquadPlans(squadId);
        return;
      }
      if (m === "both") {
        this._invalidateSquadPlans(squadId);
      }
      this._requestSquadPlans(squadId);
    }

    _setCoordinationEnabled(enabled) {
      COORD.coordinationEnabled = !!enabled;
    }

    _setCoordinationUpdateInterval(seconds) {
      COORD.updateIntervalSec = Math.max(0, Number(seconds) || 0);
    }

    _setCoordinationMaxSquadsPerUpdate(count) {
      COORD.maxSquadsPerUpdate = Math.max(0, Math.floor(Number(count) || 0));
    }

    _setCoordinationTimeSlice(seconds) {
      COORD.timeSliceSec = Math.max(0, Number(seconds) || 0);
    }

    _setCoordinationSlotDefaultTtl(seconds) {
      COORD.slotDefaultTtlSec = Math.max(0, Number(seconds) || 0);
    }

    _setCoordinationAutoReleaseOnDeregister(enabled) {
      COORD.autoReleaseOnDeregister = !!enabled;
    }

    IsAgentInSquad(agentUID, squadId) {
      const uid = Math.floor(Number(agentUID) || 0);
      const sid = this._normalizeSquadId(squadId);
      if (uid <= 0 || !sid) {
        return false;
      }
      return this._findSquadIdByAgentUID(uid) === sid;
    }

    IsSquadLeader(agentUID) {
      const uid = Math.floor(Number(agentUID) || 0);
      if (uid <= 0) {
        return false;
      }
      const sid = this._findSquadIdByAgentUID(uid);
      if (!sid) {
        return false;
      }
      const squad = COORD.squadsById.get(sid);
      return !!squad && squad.leaderUID === uid;
    }

    IsSlotFree(squadId, slotType, slotId) {
      const sid = this._normalizeSquadId(squadId);
      const st = String(slotType ?? "").trim();
      const slotName = String(slotId ?? "").trim();
      if (!sid || !st || !slotName) {
        return false;
      }

      const squad = COORD.squadsById.get(sid);
      if (!squad) {
        return true;
      }

      const slotMap = this._getSlotMap(squad, st, false);
      if (!slotMap) {
        return true;
      }

      const rec = slotMap.get(slotName);
      if (!rec) {
        return true;
      }

      return rec.ownerUID === 0 || this._isSlotExpired(rec, this._nowSec());
    }

    AgentSquad(agentUID) {
      return this._findSquadIdByAgentUID(agentUID);
    }

    SquadLeader(squadId) {
      const sid = this._normalizeSquadId(squadId);
      const squad = COORD.squadsById.get(sid);
      return squad?.leaderUID || 0;
    }

    SquadStateValue(squadId, key) {
      const sid = this._normalizeSquadId(squadId);
      const k = String(key ?? "").trim();
      const squad = COORD.squadsById.get(sid);
      if (!squad || !k || !squad.state.has(k)) {
        return 0;
      }
      return squad.state.get(k);
    }

    CountSquadAgents(squadId) {
      const sid = this._normalizeSquadId(squadId);
      const squad = COORD.squadsById.get(sid);
      return squad?.members.length || 0;
    }

    GetSquadAgentUIDByIndex(squadId, index) {
      const sid = this._normalizeSquadId(squadId);
      const i = Math.floor(Number(index) || 0);
      const squad = COORD.squadsById.get(sid);
      if (!squad || i < 0 || i >= squad.members.length) {
        return 0;
      }
      return squad.members[i];
    }

    SlotOwner(squadId, slotType, slotId) {
      const sid = this._normalizeSquadId(squadId);
      const st = String(slotType ?? "").trim();
      const slotName = String(slotId ?? "").trim();
      const squad = COORD.squadsById.get(sid);
      if (!squad) {
        return 0;
      }
      const slotMap = this._getSlotMap(squad, st, false);
      const rec = slotMap?.get(slotName);
      if (!rec || this._isSlotExpired(rec, this._nowSec())) {
        return 0;
      }
      return rec.ownerUID || 0;
    }

    AssignedSlotId(agentUID, slotType) {
      const uid = Math.floor(Number(agentUID) || 0);
      const st = String(slotType ?? "").trim();
      const agent = this._getAgentByUID(uid);
      if (!agent || !st) {
        return "";
      }
      return String(agent._assignedSlots.get(st) || "");
    }

    CountSquads() {
      return COORD.squadsById.size;
    }

    CoordinationEnabled() {
      return COORD.coordinationEnabled ? 1 : 0;
    }

    CoordinationIntervalSec() {
      return COORD.updateIntervalSec;
    }

    CoordinationTimeSliceSec() {
      return COORD.timeSliceSec;
    }

    CoordinationPassesThisTick() {
      return COORD.passesThisTick;
    }

    ExpiredSlotsReleased() {
      return COORD.expiredSlotsReleased;
    }

    // Condition and expression helpers
    IsExecuting(taskId) {
      return this.CurrentTask() === String(taskId ?? "");
    }

    IsAlertTier(tier) {
      return this._alertTier === Math.floor(Number(tier) || 0);
    }

    IsInCombat() {
      return this._alertTier >= TIER_COMBAT;
    }

    IsAlerted() {
      return this._alertTier >= TIER_ALERTED;
    }

    HasTarget() {
      return Number(this._getWorldStateValue("targetUID", 0)) !== 0 &&
        Number(this._getWorldStateValue("targetVisible", 0)) === 1;
    }

    IsPaused() {
      return this._isPaused;
    }

    IsEnabled() {
      return this._isEnabled;
    }

    HasActivePlan() {
      if (this._isInTemporaryTask) {
        return true;
      }
      if (this.CurrentTask()) {
        return true;
      }
      const length = this.PlanLength();
      return length > 0;
    }

    IsInTemporaryTask() {
      return this._isInTemporaryTask;
    }

    HasWorldState(key) {
      const value = this._getWorldStateValue(String(key ?? ""), undefined);
      return value !== undefined && value !== null;
    }

    CurrentTask() {
      if (this._isInTemporaryTask) {
        return this._temporaryTaskId;
      }
      const value = this._getManagerValue("_getActiveTask", [this._uid()], this._currentTask);
      this._currentTask = String(value || "");
      return this._currentTask;
    }

    PreviousTask() {
      return this._previousTask;
    }

    CompletedTask() {
      return this._completedTask;
    }

    FailedTask() {
      return this._failedTask;
    }

    RestoredTask() {
      return this._restoredTask;
    }

    AlertLevel() {
      const value = Number(
        this._getManagerValue("_getAlertLevel", [this._uid()], this._alertLevel)
      );
      this._setAlertLevel(value);
      return this._alertLevel;
    }

    AlertTier() {
      return this._alertTier;
    }

    AlertTierName() {
      return this._tierName(this._alertTier);
    }

    PreviousTier() {
      return this._previousTier;
    }

    StimulusType() {
      return this._stimulusType;
    }

    StimulusX() {
      return this._stimulusX;
    }

    StimulusY() {
      return this._stimulusY;
    }

    StimulusIntensity() {
      return this._stimulusIntensity;
    }

    WorldState(key) {
      return this._getWorldStateValue(String(key ?? ""), 0);
    }

    PlanLength() {
      if (this._isInTemporaryTask) {
        return 1;
      }
      const length = this._getManagerValue("_getPlanLength", [this._uid()], 0);
      return Math.max(0, Math.floor(Number(length) || 0));
    }

    PlanTaskAtIndex(index) {
      if (this._isInTemporaryTask) {
        return this._temporaryTaskId;
      }
      return String(
        this._getManagerValue("_getPlanTaskAtIndex", [this._uid(), Number(index) || 0], "")
      );
    }

    TargetUID() {
      return Number(this._getWorldStateValue("targetUID", 0)) || 0;
    }

    LastKnownX() {
      return Number(this._getWorldStateValue("lastKnownX", 0)) || 0;
    }

    LastKnownY() {
      return Number(this._getWorldStateValue("lastKnownY", 0)) || 0;
    }

    AgentType() {
      return this._agentType;
    }

    Enabled() {
      return this._isEnabled;
    }
  };
}
