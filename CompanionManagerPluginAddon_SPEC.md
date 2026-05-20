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
  - **Recommended path (Behavior-driven)**: Use task network builder ACEs on behavior addon (Initialize → Add → Load) to compose networks declaratively, export as JSON from world-state keys, then register with manager.
  - **Manager-direct path (Manager Builder)**: Use manager's native builder ACEs (BeginTaskNetwork/BeginUtilityScorer → Add* → RegisterBuiltTaskNetwork/RegisterBuiltUtilityScorer) to define content directly on manager.
  - **Legacy-compatible path**: JSON registration via `Setup: Register ...` actions (both behavior and manager support this).
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

### Slot operations (Two setup paths)

**Traditional path (raw JSON or action-by-action):**
- define slot positions by type and ID via action
- reserve/release slot ownership with TTL
- auto-assign nearest free slot
- expired reservations auto-release

**Recommended path (Slot Builder ACEs):**
- Use behavior addon slot builder ACEs: Initialize Slot Builder → Add Slot to Builder → Load Slot Set from Builder
- Compose slot maps declaratively without JSON syntax errors
- Export to JSON for reuse across projects
- Can be stored in project libraries and version-controlled

Companion should treat slot ownership as exclusive while reservation is valid. Slot builder outputs integrate seamlessly with existing slot reservation/release/auto-assign operations.

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
The script API comes from ACE-exposed methods. Both behavior addon and manager plugin expose methods; prefer the behavior addon for content composition, manager for registration and control.

### Behavior Addon - Content Builders (Composition)

**Slot Builder ACEs** (Coordination category):
- InitializeSlotBuilder(squadId, slotType) - Start slot collection
- AddSlotToBuilder(squadId, slotType, slotId, x, y) - Add one slot
- LoadSlotSetFromBuilder(squadId, slotType) - Commit and export to JSON

**Task Network Builder ACEs** (Setup category):
- InitializeTaskNetworkBuilder(networkId) - Start network definition
- AddTaskToNetworkBuilder(taskId, networkId, description, taskType) - Add task with type (primitive, composite, method)
- LoadTaskNetworkFromBuilder(networkId, exportKey) - Commit and export to JSON string via world state

### Manager Plugin - Control Methods (Manager-direct approach)

**Manager Builder methods** (still available for direct registration):
- BeginTaskNetwork(agentType, rootTask)
- ClearTaskNetwork(agentType)
- AddCompoundTask(agentType, taskName)
- AddPrimitiveTask(agentType, taskName, primitiveId)
- AddMethod(agentType, taskName, methodId)
- AddMethodCondition(agentType, taskName, methodId, key, op, value)
- AddMethodSubtask(agentType, taskName, methodId, subtaskTaskName)
- SetMethodUtilityScorer(agentType, taskName, methodId, scorerId)
- RegisterBuiltTaskNetwork(agentType)
- BeginUtilityScorer(scorerId, aggregation)
- ClearUtilityScorer(scorerId)
- AddUtilityInputLinear(scorerId, worldStateKey, weight, invert, x1, y1, x2, y2)
- RegisterBuiltUtilityScorer(scorerId)

Legacy JSON setup examples (still supported by both addons):
- RegisterTaskNetwork(agentType, networkJson)
- RegisterUtilityScorer(scorerJson)

Runtime control examples:
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
- **Preferred setup path for large projects**: Use behavior addon slot/task network builders to compose content declaratively, export as JSON, then import into manager or store as project libraries.
- **For immediate scripting**: Manager plugin builder methods remain available for direct network registration without going through behavior addon.
- Combo params should use the ACE-exposed value shape for that action (for example `"interval_sec"`, `"request"`, `"minimum"`, or `"1"` for yes/no combos).
- Underscore-prefixed methods are internal and unstable. Use only ACE-exposed public methods.

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

## 12. Integration Pattern Examples

### Pattern A: Behavior Addon Builders (Recommended for teams/large projects)
```javascript
const guard = runtime.objects.Guard.getFirstInstance();
const guardAI = guard.behaviors.UtilityDrivenHTNAgent;
const manager = runtime.objects.Manager.getFirstInstance();

// Compose task network using behavior addon builders
guardAI.InitializeTaskNetworkBuilder("guard");
guardAI.AddTaskToNetworkBuilder("idle", "guard", "Stand and wait", "primitive");
guardAI.AddTaskToNetworkBuilder("patrol", "guard", "Walk patrol route", "primitive");
guardAI.AddTaskToNetworkBuilder("chase", "guard", "Pursue target", "primitive");
guardAI.LoadTaskNetworkFromBuilder("guard", "exportedNetwork");

// Export JSON from world state
const networkJSON = guardAI.WorldState("exportedNetwork");
console.log("Exported network:", networkJSON);
// Store in project library or send to manager

// Register with manager (via JSON or directly)
const networkData = JSON.parse(networkJSON);
manager.RegisterTaskNetwork("guard", JSON.stringify(networkData));

// Compose slot formation using behavior addon builders
guardAI.InitializeSlotBuilder("guard_squad", "stance");
guardAI.AddSlotToBuilder("guard_squad", "stance", "point", 0, 0);
guardAI.AddSlotToBuilder("guard_squad", "stance", "left_wing", -150, 100);
guardAI.AddSlotToBuilder("guard_squad", "stance", "right_wing", 150, 100);
guardAI.LoadSlotSetFromBuilder("guard_squad", "stance");

// Slots are now available for auto-assignment
guardAI.AutoAssignNearestFreeSlot(guard.uid, "guard_squad", "stance", guard.x, guard.y, 500, 1.5);
```

### Pattern B: Manager Direct Builders (For immediate setup)
```javascript
const manager = runtime.objects.Manager.getFirstInstance();

// Setup utilities and networks directly on manager
manager.BeginUtilityScorer("guard_combat", "weighted_sum");
manager.AddUtilityInputLinear("guard_combat", "targetVisible", 1, "0", 0, 0, 1, 1);
manager.RegisterBuiltUtilityScorer("guard_combat");

manager.BeginTaskNetwork("guard", "guard_root");
manager.AddCompoundTask("guard", "guard_root");
manager.AddPrimitiveTask("guard", "chase_target", "chase");
manager.AddMethod("guard", "guard_root", "m_chase");
manager.AddMethodCondition("guard", "guard_root", "m_chase", "targetVisible", "eq", 1);
manager.SetMethodUtilityScorer("guard", "guard_root", "m_chase", "guard_combat");
manager.AddMethodSubtask("guard", "guard_root", "m_chase", "chase_target");
manager.RegisterBuiltTaskNetwork("guard");
```

### Pattern C: Runtime Management (Both patterns support this)
```javascript
const manager = runtime.objects.Manager.getFirstInstance();

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

### Pattern D: Legacy JSON (Still supported, both addons)
```javascript
const manager = runtime.objects.Manager.getFirstInstance();

// JSON registration remains valid
manager.RegisterTaskNetwork("guard", guardNetworkJson);
manager.RegisterUtilityScorer(guardCombatScorerJson);
```

## 13. Compatibility and Versioning Guidance
- Treat task IDs, world-state key names, and squad key names as API contracts.
- Add new keys/behaviors in backward-compatible ways.
- Do not depend on manager internal underscore methods.
- Prefer ACE-exposed methods only.

## 14. Content Libraries and Export Workflow

Behavior addon builders enable creation of reusable, version-controlled content libraries:

1. **Compose**: Use slot/task network builder ACEs in behavior addon to define content
2. **Export**: Extract JSON from world-state keys after builder commit
3. **Store**: Save JSON files in project `assets/ai_content/` directories
4. **Organize**: Group formations, routes, networks, tactics by purpose
5. **Share**: Commit to Git and share across team projects
6. **Import**: Load JSON and register with manager at runtime

**Example library structure:**
```
assets/ai_content/
├── formations/
│   ├── defensive_v.json
│   ├── flanking_triangle.json
│   └── ambush_8ring.json
├── routes/
│   ├── patrol_square.json
│   └── invasion_entry_points.json
├── networks/
│   ├── guard_basic.json
│   ├── enemy_combat.json
│   └── boss_difficulty_1.json
└── tactics/
    ├── siege_fire_rotation.json
    └── extraction_360_coverage.json
```

See Guide.md sections 10 and 24 for comprehensive content creation examples.

## 15. Companion Checklist
- Register scorers before any task-network method references those scorer IDs.
- Register networks/scorers before requesting plans.
- **Recommended**: Use behavior addon builders for content composition in team projects.
- Manager builder methods remain available for direct scripting when needed.
- Export builder outputs to JSON for team reuse and version control.
- Register all participating agents with correct agentType.
- Feed required world-state keys every update window.
- Subscribe to task/alert/squad triggers.
- Execute selected tasks in companion runtime.
- Mark complete/failed outcomes.
- Validate performance settings for target platform.
- Validate exported JSON before registering with manager.
