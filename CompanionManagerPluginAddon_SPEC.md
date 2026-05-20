# Companion Addon Context Spec

This file defines the integration contract for the Utility-Driven HTN Manager addon so a companion addon can interact with it safely and consistently.

## 1. Addon Identity
- Addon ID: salmanshh_DHTN_manager
- Addon Name: Utility-Driven HTN (Hierarchical Task Network) Manager
- Addon Type: Plugin (Object)
- Scope: Single global manager instance
- Primary Role: Headless AI planning/orchestration service for agents

## 2. Architecture Summary
The manager does not move or animate instances directly. It manages:
- HTN task decomposition
- Utility-based method selection
- Alert/stimulus state
- Plan lifecycle and interrupts
- Squad coordination and slot reservation

The companion addon should execute gameplay effects for selected tasks and keep world-state data updated.

## 3. Data Model
### Agent state (manager-side)
Each registered agent tracks:
- uid (number)
- agentType (string)
- alertBaseLevel (0..1)
- alertLevel (0..1)
- alertTierIndex (0..3)
- worldState (key-value map)
- stimuli (array)
- plan (string[])
- activeTask (string)
- previousTask (string)
- paused (boolean)
- planStale (boolean)

### Global state
- manager-level key-value map shared by all agents

### Coordination state
- squads map: squadId -> { leaderUID, members, state, slots, slotPoints }
- agentSquads map: agentUID -> squadId
- agentAssignedSlots map: agentUID -> { slotType: slotId }

## 4. Planning Lifecycle Contract
1. Companion registers required task network(s) and utility scorer(s).
2. Companion provides world-state inputs continuously.
3. Companion requests or invalidates plans based on gameplay events.
4. Manager emits task/plan/alert triggers.
5. Companion executes concrete gameplay behavior for active task.
6. Companion marks completion/failure when done.

## 5. Alert and Stimulus Contract
- Stimuli are additive and decay over time.
- Effective alertLevel is derived from base level + active stimuli.
- Alert tiers:
  - 0: unaware
  - 1: suspicious
  - 2: alerted
  - 3: combat
- Tier transitions emit OnAlertStateChanged.

## 6. Coordination Contract
### Squad operations
- assign/remove agent membership
- set squad leader
- write/read squad shared keys
- invalidate/request plans for whole squad

### Slot operations
- define slot positions by type and ID
- reserve/release slot ownership with TTL
- auto-assign nearest free slot
- expired reservations auto-release

Companion should treat slot ownership as exclusive while reservation is valid.

## 7. Performance Contract
Manager update behavior is configurable by properties/actions:
- planning mode: per_frame or interval_sec
- planning interval seconds
- max agents per update
- planning time slice seconds

Companion should avoid forcing immediate replans every tick unless required.

## 8. Save/Load Contract
Manager persists:
- registered networks/scorers
- agents and plans
- global state
- squads and slot state
- manager performance flags

Companion should keep world-state schema stable across versions when relying on saves.

## 9. Scripting API Surface (Single Source = ACE Exposure)
The script API comes from ACE-exposed methods.

### Write/control methods (actions)
Examples:
- RegisterTaskNetwork(agentType, networkJson)
- RegisterUtilityScorer(scorerJson)
- SetWorldStateKey(agentUID, key, value)
- SetGlobalStateKey(key, value)
- RequestPlan(agentUID)
- InvalidatePlan(agentUID)
- ForceTask(agentUID, taskId)
- MarkTaskComplete(agentUID)
- MarkTaskFailed(agentUID)
- AddAlertStimulus(agentUID, type, intensity, x, y)
- AssignAgentToSquad(agentUID, squadId)
- SetSquadStateKey(squadId, key, value)
- AutoAssignNearestFreeSlot(agentUID, squadId, slotType, agentX, agentY, maxDistance, ttlSec)

### Read/query methods (expressions)
Examples:
- TriggerAgentUID()
- CurrentTask()
- ActiveTask(agentUID)
- AlertLevel()
- CountAgents()
- GetAgentUIDByIndex(index)
- AgentSquad(agentUID)
- SquadLeader(squadId)
- SlotOwner(squadId, slotType, slotId)

### Event helper methods
- on(tag, callback, options)
- off(tag, callback)
- dispatch(tag)

Notes:
- Combo params are passed as numeric indices in script calls.
- Underscore-prefixed methods are internal and unstable.

## 10. Trigger/Event Contract
Primary triggers companion should consume:
- OnPrimitiveTaskStarted
- OnTaskCompleted
- OnTaskFailed
- OnPlanFailed
- OnPlanInterrupted
- OnAlertStateChanged
- OnStimulusReceived
- OnSquadStateChanged
- OnSlotReserved
- OnSlotReleased
- OnSquadMembershipChanged

Use trigger-context query methods immediately in callback to capture current event data.

## 11. Required Companion Responsibilities
Companion addon should:
- own physical movement, pathing, animation, and combat actions
- keep world-state keys fresh for each managed agent
- translate activeTask IDs into concrete behavior execution
- report task completion/failure promptly
- avoid stale slot locks by honoring reservation lifecycle

## 12. Integration Pattern Example
```javascript
const manager = runtime.objects.TactiCoreManager.getFirstInstance();

// setup
manager.RegisterTaskNetwork("guard", guardNetworkJson);
manager.RegisterUtilityScorer(guardCombatScorerJson);
manager.RegisterUtilityScorer(guardRetreatScorerJson);

// per-tick context feed
function updateAgentContext(uid, data) {
  manager.SetWorldStateKey(uid, "targetVisible", data.targetVisible ? 1 : 0);
  manager.SetWorldStateKey(uid, "health", data.health);
  manager.SetWorldStateKey(uid, "distanceToTarget", data.distanceToTarget);
}

// task dispatch
manager.on("OnPrimitiveTaskStarted", () => {
  const uid = manager.TriggerAgentUID();
  const task = manager.CurrentTask();
  // Companion executes task-specific behavior here.
});

// fallback handling
manager.on("OnTaskFailed", () => {
  const uid = manager.TriggerAgentUID();
  manager.ForceTask(uid, "fallback_idle");
});
```

## 13. Compatibility and Versioning Guidance
- Treat task IDs, world-state key names, and squad key names as API contracts.
- Add new keys/behaviors in backward-compatible ways.
- Do not depend on manager internal underscore methods.
- Prefer ACE-exposed methods only.

## 14. Companion Checklist
- Register networks/scorers before requesting plans.
- Register all participating agents with correct agentType.
- Feed required world-state keys every update window.
- Subscribe to task/alert/squad triggers.
- Execute selected tasks in companion runtime.
- Mark complete/failed outcomes.
- Validate performance settings for target platform.
