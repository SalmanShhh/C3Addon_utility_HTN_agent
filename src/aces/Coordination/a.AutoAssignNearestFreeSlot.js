export const config = {
  listName: "Coordination: Auto Assign Nearest Free Slot",
  displayText: "Auto assign nearest free {2} slot in squad {1} to agent UID {0} from ({3}, {4}) within {5} with ttl {6} sec",
  description: "Finds nearest free slot and reserves it for the agent.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Agent instance UID.", type: "number", initialValue: "0" },
    { id: "squadId", name: "Squad ID", desc: "Squad id.", type: "string", initialValue: '"alpha"' },
    { id: "slotType", name: "Slot Type", desc: "Slot type name.", type: "string", initialValue: '"coverSlot"' },
    { id: "agentX", name: "Agent X", desc: "Agent x position.", type: "number", initialValue: "0" },
    { id: "agentY", name: "Agent Y", desc: "Agent y position.", type: "number", initialValue: "0" },
    { id: "maxDistance", name: "Max Distance", desc: "Maximum search distance. 0 means unlimited.", type: "number", initialValue: "0" },
    { id: "ttlSec", name: "TTL (sec)", desc: "Reservation lifetime in seconds.", type: "number", initialValue: "1" },
  ],
};

export const expose = true;

export default function (agentUID, squadId, slotType, agentX, agentY, maxDistance, ttlSec) {
  this._autoAssignNearestFreeSlot(agentUID, squadId, slotType, agentX, agentY, maxDistance, ttlSec);
}
