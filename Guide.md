# Utility-Driven HTN (Hierarchical Task Network) Agent - Guide

Utility-Driven HTN Agent is a per-instance Construct 3 behavior that connects each world object to a global AI manager, then handles planning ticks, task flow, alert state, and stimulus routing for that one object. It removes repetitive event-sheet glue like registration, periodic replanning, task bookkeeping, and target state syncing, so you can focus on gameplay behavior logic instead of AI plumbing.

## Table of Contents

1. [Scenarios Where This Addon Excels](#1-scenarios-where-this-addon-excels)
2. [Core Concepts](#2-core-concepts)
3. [Project Setup](#3-project-setup)
4. [Plugin Properties](#4-plugin-properties)
5. [Planning and Task Flow](#5-planning-and-task-flow)
6. [World State and Blackboard Keys](#6-world-state-and-blackboard-keys)
7. [Signals and Alert Reactions](#7-signals-and-alert-reactions)
8. [Temporary Tasks and Manual Control](#8-temporary-tasks-and-manual-control)
9. [Performance and Scaling](#9-performance-and-scaling)
10. [9A. Squad Coordination, Roles, and Slot Tactics](#9a-squad-coordination-roles-and-slot-tactics)
10. [Actions Reference](#10-actions-reference)
11. [Conditions Reference](#11-conditions-reference)
12. [Expressions Reference](#12-expressions-reference)
13. [Triggers Reference](#13-triggers-reference)
14. [System Use Cases](#14-system-use-cases)
15. [Game Use Cases](#15-game-use-cases)
16. [Scripting (C3 Script / JavaScript)](#16-scripting-c3-script--javascript)
17. [Using This Addon With the Manager Companion](#17-using-this-addon-with-the-manager-companion)
18. [Tips and Common Mistakes](#18-tips-and-common-mistakes)

## 1. Scenarios Where This Addon Excels

- **Large Enemy Populations**: Run many AI agents with deliberate or hybrid planning modes and tune interval in seconds for stable CPU.
- **Stealth Detection Loops**: Feed sight and sound events through built-in signal actions so alert transitions and target memory happen automatically.
- **Task-Based Event Sheet AI**: Drive animation and movement from task IDs instead of deeply nested state variables.
- **Cutscene Overrides**: Push temporary tasks to pause normal behavior briefly, then return to normal AI flow.
- **Mixed Agent Archetypes**: Use one behavior for guards, drones, civilians, and bosses by changing agentType.
- **Performance Gating by Distance**: Turn Enabled off for far-away agents, then re-enable when the player enters a region.

## 2. Core Concepts

### The problem this addon solves

Without this behavior, each AI object needs repetitive setup events for manager registration, periodic replanning, task completion/failure handling, world-state writes, alert tracking, and cleanup on destroy. This behavior centralizes that per-instance lifecycle so your event sheet can stay focused on gameplay actions.

### Key design decisions

- **Per-instance ownership**: each behavior instance manages exactly one object UID.
- **Manager-first architecture**: planning and global AI data live in the manager plugin, while this behavior acts as the object bridge.
- **Manual primitive completion**: you call Mark Task Complete or Mark Task Failed when your gameplay action ends.
- **Seconds-based tuning**: planning interval and task timeout use seconds, not frequency.
- **Soft-fail manager lookup**: if manager is missing, behavior logs warning and suspends processing instead of crashing.

### Key concepts at a glance

| Concept | Meaning |
|---|---|
| **Agent Type** | String key selecting which task network this instance should use. |
| **Planning Mode** | Reactive, deliberate, or hybrid strategy that decides when to replan. |
| **World State** | Per-agent key-value blackboard used by AI decisions and event-sheet logic. |
| **Signal** | Convenience action that reports sight, sound, or damage stimulus. |
| **Temporary Task** | Short override task that interrupts normal plan until timeout or manual clear. |
| **Enabled** | Master processing toggle for this behavior instance. |

## 3. Project Setup

1. Add the manager plugin object to the layout.
2. Add this behavior to each world object that should run AI.
3. Set Agent Type to a task network ID defined in the manager.
4. Pick a Planning Mode and Planning Interval (sec).
5. Add On Task Started events to drive movement, animation, and actions.
6. Call Mark Task Complete or Mark Task Failed when each primitive action ends.

Example first working setup:

```text
Event: On start of layout
  Action: Enemy.AI -> Setup: Set Enabled -> true
  Action: Enemy.AI -> Setup: Set Planning Mode -> "hybrid"
  Action: Enemy.AI -> Setup: Set Planning Interval -> 1.0
  // establishes baseline AI behavior for all enemy instances

Event: Enemy.AI -> On Task Started
  Condition: Enemy.AI -> Is Executing -> "patrol"
  Action: Enemy -> MoveTo(PositionOfNextPatrolPoint)
  // patrol execution branch

Event: Enemy -> On reached destination
  Condition: Enemy.AI -> Is Executing -> "patrol"
  Action: Enemy.AI -> Task: Mark Task Complete
  // tells planner to advance to the next primitive task
```

## 4. Plugin Properties

| Property | Type | Default | Description |
|---|---|---|---|
| Agent Type | Text | default | Selects AI profile for this instance. Use case: assign grunt for regular enemies and boss for elite enemies. |
| Planning Mode | Combo | hybrid | Controls replan strategy. Use case: deliberate for background NPCs, reactive for bosses. |
| Planning Interval (sec) | Float | 1.0 | Seconds between periodic replans in deliberate and hybrid mode. Use case: raise interval to save CPU. |
| Urgency Threshold | Float | 0.55 | Hybrid immediate-replan threshold from 0 to 1. Use case: lower for faster stealth reactions. |
| Initial Alert Level | Float | 0.0 | Starting alert level from 0 to 1. Use case: start an ambush group already suspicious. |
| Task Timeout (sec) | Float | 0.0 | Auto-fail timeout for stuck tasks, 0 disables. Use case: recover from blocked path tasks. |
| Auto Register | Check | true | Registers this instance with manager at create. Use case: disable for scripted delayed activation. |
| Enabled | Check | true | Master processing switch. Use case: disable off-screen agents for performance. |
| Debug Label | Text | empty | Optional text shown in warnings. Use case: identify specific guard in logs. |

## 5. Planning and Task Flow

This behavior reads current task from manager, tracks task transitions, and fires task triggers for event-sheet branching.

When to use:
- You want task-driven AI execution with clean event conditions.
- You want automatic periodic replanning with manual task completion control.

How to configure:
- Set planning mode and interval in setup.
- Implement one event branch per important task ID.
- Call Mark Task Complete when task objective is done.

```text
Event: Enemy.AI -> On Task Started
  Condition: Enemy.AI -> Is Executing -> "investigate"
  Action: Enemy -> MoveTo(Enemy.AI.LastKnownX, Enemy.AI.LastKnownY)
  // this branch starts investigation movement

Event: Enemy -> On reached destination
  Condition: Enemy.AI -> Is Executing -> "investigate"
  Action: Enemy.AI -> Task: Mark Task Complete
  // planner can now continue to the next step
```

Gotchas:
- If you never call Mark Task Complete or Mark Task Failed, tasks can stall.
- On Plan Failed condition exists, but current runtime does not explicitly trigger it.

## 6. World State and Blackboard Keys

World state actions let you write and clear per-agent keys without calling manager APIs directly in event sheets.

When to use:
- You need blackboard values used by methods, utility scoring, or event filters.
- You want compact event logic for patrol points and target data.

```text
Event: On start of layout
  Action: Enemy.AI -> World State: Set Patrol Point -> 0, 100, 200
  Action: Enemy.AI -> World State: Set Patrol Point -> 1, 450, 200
  Action: Enemy.AI -> World State: Set World State -> "patrolIndex", 0
  // creates patrol route data at startup
```

Gotchas:
- Clear World State Key writes null, so Has World State can become false for that key.
- Keep key names consistent across manager JSON and event sheet writes.

## 7. Signals and Alert Reactions

Signals are shorthand actions for common AI sensory events.

When to use:
- Sight checks, hearing checks, and damage events should influence planning quickly.
- You want consistent world-state updates with each sensory event.

```text
Event: Every tick
  Condition: Enemy has line of sight to Player
  Action: Enemy.AI -> Signals: Signal Target Seen -> Player.UID, Player.X, Player.Y, 1.0
  // sends visual stimulus and updates target keys

Event: Enemy.AI -> On Alert Changed
  Condition: Enemy.AI -> Is In Combat
  Action: Enemy -> Set animation -> "combat"
  // visual feedback when alert tier reaches combat
```

Gotchas:
- Signal Target Lost only sets targetVisible to 0, it does not clear target UID.
- Signal Damaged scales intensity by damage/100 and always requests immediate replan.

## 8. Temporary Tasks and Manual Control

Temporary task control is useful for scripted interruptions and short overrides.

When to use:
- Cutscenes, scripted pauses, forced reactions, and brief interrupts.

```text
Event: Cutscene starts
  Action: Enemy.AI -> Task: Push Temporary Task -> "idle", 4.0
  // forces idle for 4 seconds

Event: Enemy.AI -> On Temporary Task Ended
  Action: Enemy -> Set animation -> "patrol"
  // resumes normal visual behavior
```

Gotchas:
- Pushing a temporary task while one is active replaces previous temporary context.
- Pause stops processing, Resume triggers immediate replan.

## 9. Performance and Scaling

Use Enabled, planning mode, and interval to control cost per agent.

Recommended strategy:
- Enabled false for off-screen or far-away agents.
- Deliberate mode with larger interval for low-priority agents.
- Reactive mode only for high-priority enemies.

```text
Event: Every 0.25 seconds
  Condition: distance(Player, Enemy) > 2000
  Action: Enemy.AI -> Setup: Set Enabled -> false
  // disables heavy updates for distant agents

Event: Every 0.25 seconds
  Condition: distance(Player, Enemy) <= 2000
  Action: Enemy.AI -> Setup: Set Enabled -> true
  Action: Enemy.AI -> Setup: Set Processing Interval -> 0.5
  // reactivates nearby agents with responsive interval
```

Gotchas:
- Enabled false skips tick processing, so state updates from manager polling also pause.
- Very low planning intervals on many instances can spike CPU.

## 9A. Squad Coordination, Roles, and Slot Tactics

The coordination layer lets multiple agents share squad data, reserve tactical slots, and replan as a group without writing custom per-agent glue.

### Coordination ACE groups

- Membership and leadership: Assign Agent To Squad, Remove Agent From Squad, Set Squad Leader.
- Shared squad state: Set Squad State Key, Clear Squad State Key, SquadStateValue.
- Slot system: Reserve Slot, Release Slot, Set Slot Position, Auto Assign Nearest Free Slot.
- Slot data import: Load Slot Positions From JSON, Load Slot Positions From World State Key.
- Plan control: Invalidate Squad Plans, Request Squad Plans, Squad Plan Control.
- Performance controls: Set Coordination Enabled, Set Coordination Update Interval, Set Max Squads Per Update, Set Coordination Time Slice.

### Coordination use cases

#### 1. Basic squad setup at layout start

**Scenario:** You have 4 guards and want them all in squad alpha with one explicit leader.

```text
Event: On start of layout
  Action: Guard1.AI -> Coordination: Assign Agent To Squad -> Guard1.UID, "alpha"
  Action: Guard2.AI -> Coordination: Assign Agent To Squad -> Guard2.UID, "alpha"
  Action: Guard3.AI -> Coordination: Assign Agent To Squad -> Guard3.UID, "alpha"
  Action: Guard4.AI -> Coordination: Assign Agent To Squad -> Guard4.UID, "alpha"
  Action: Guard1.AI -> Coordination: Set Squad Leader -> "alpha", Guard1.UID
  // initializes deterministic squad membership and leader role
```

Tip: If the leader is removed later, runtime promotes fallback leader by lowest UID.

#### 2. Leader writes shared tactic and target point

**Scenario:** The squad leader sets tactic and approach point, and all members consume the mirrored squad keys.

```text
Event: Every 0.25 seconds
  Condition: Guard1.AI -> Is Squad Leader -> Guard1.UID
  Action: Guard1.AI -> Coordination: Set Squad State Key -> "alpha", "tactic", "flank"
  Action: Guard1.AI -> Coordination: Set Squad State Key -> "alpha", "targetX", Player.X
  Action: Guard1.AI -> Coordination: Set Squad State Key -> "alpha", "targetY", Player.Y
  // writes shared decision data once from the leader

Event: Guard2.AI -> On Squad State Changed
  Action: Guard2.AI -> Task: Request Replan
  // followers can react immediately when tactical data changes
```

Tip: Avoid writing unchanged values every tick to prevent unnecessary replans.

#### 3. Reserve unique cover slots with TTL

**Scenario:** Squad members reserve different cover slots so they do not overlap.

```text
Event: On start of layout
  Action: Guard1.AI -> Coordination: Set Slot Position -> "alpha", "coverSlot", "A1", 320, 180
  Action: Guard1.AI -> Coordination: Set Slot Position -> "alpha", "coverSlot", "A2", 420, 180
  Action: Guard1.AI -> Coordination: Set Slot Position -> "alpha", "coverSlot", "A3", 520, 180

Event: Guard.AI -> On Task Started
  Condition: Guard.AI -> Is Executing -> "takeCover"
  Action: Guard.AI -> Coordination: Auto Assign Nearest Free Slot -> Guard.UID, "alpha", "coverSlot", Guard.X, Guard.Y, 800, 1.5
  // nearest free slot gets reserved with expiration
```

Tip: Use a non-zero TTL so abandoned reservations expire automatically.

#### 4. Import slot map from JSON at runtime

**Scenario:** Level script builds slot JSON and loads it directly into coordination.

```text
Event: On start of layout
  Action: Guard1.AI -> Coordination: Load Slot Positions From JSON -> "alpha", "flankSlot", "[{\"slotId\":\"L1\",\"x\":120,\"y\":200},{\"slotId\":\"R1\",\"x\":760,\"y\":200}]"
  // creates multiple tactical slots from one import payload
```

Tip: JSON entries should include slotId, x, and y fields.

#### 5. Load slot map from world-state key

**Scenario:** A manager task writes slot JSON into an agent key and followers import from that key.

```text
Event: Squad manager update
  Action: Guard1.AI -> World State: Set World State -> "slotData", "[{\"slotId\":\"C1\",\"x\":250,\"y\":150}]"

Event: Guard1.AI -> On Squad State Changed
  Action: Guard1.AI -> Coordination: Load Slot Positions From World State Key -> "alpha", "coverSlot", "agent", "slotData", Guard1.UID
  // reads JSON string from world-state and imports slot positions
```

Tip: Scope local reads from current behavior instance, scope agent reads from supplied UID.

#### 6. Membership change trigger for cleanup

**Scenario:** A guard dies and should leave squad cleanly.

```text
Event: Guard -> On destroyed
  Action: Guard.AI -> Coordination: Remove Agent From Squad -> Guard.UID
  // releases owned slots and updates squad member list

Event: Guard1.AI -> On Squad Membership Changed
  Action: Guard1.AI -> Coordination: Request Squad Plans -> "alpha"
  // immediate re-evaluation after member count changes
```

Tip: Auto-release on deregister can be toggled with coordination settings if you want manual release flow.

#### 7. Controlled squad replans after assignment updates

**Scenario:** You batch several slot/state changes first, then trigger one squad request.

```text
Event: Tactical update window
  Action: Guard1.AI -> Coordination: Invalidate Squad Plans -> "alpha"
  Action: Guard1.AI -> Coordination: Set Squad State Key -> "alpha", "tactic", "pin"
  Action: Guard1.AI -> Coordination: Set Slot Reservation -> "reserve", "alpha", "flankSide", "left", Guard2.UID, 2.0
  Action: Guard1.AI -> Coordination: Squad Plan Control -> "request", "alpha"
  // one grouped replan pass after all tactical writes
```

Tip: Group writes and request once to reduce plan spam.

#### 8. Coordination performance tuning for large battles

**Scenario:** You have many squads and need to cap coordination work each pass.

```text
Event: On start of layout
  Action: Guard1.AI -> Coordination: Set Coordination Enabled -> true
  Action: Guard1.AI -> Coordination: Set Coordination Update Interval -> 0.1
  Action: Guard1.AI -> Coordination: Set Max Squads Per Update -> 4
  Action: Guard1.AI -> Coordination: Set Coordination Time Slice -> 0.002
  // applies global caps to smooth frame-time spikes

Event: Every 1.0 seconds
  Action: DebugText -> Set text -> "CoordPasses=" & Guard1.AI.CoordinationPassesThisTick & " ExpiredReleased=" & Guard1.AI.ExpiredSlotsReleased
  // runtime telemetry check for tuning
```

Tip: If max squads and slice are both strict, keep at least one squad processed by leaving update interval reasonable.

#### 9. Leader fallback and rapid reassignment

**Scenario:** Current leader is eliminated and you immediately promote a specific fallback leader for cleaner tactical continuity.

```text
Event: LeaderGuard -> On destroyed
  Action: LeaderGuard.AI -> Coordination: Remove Agent From Squad -> LeaderGuard.UID
  Action: Guard2.AI -> Coordination: Set Squad Leader -> "alpha", Guard2.UID
  Action: Guard2.AI -> Coordination: Set Squad State Key -> "alpha", "tactic", "regroup"
  Action: Guard2.AI -> Coordination: Squad Plan Control -> "request", "alpha"
  // explicit leader handoff and immediate squad replan
```

Tip: Explicit reassignment avoids one-frame ambiguity during heavy combat transitions.

#### 10. Dynamic breach lane reservation

**Scenario:** Assault squad claims unique breach lanes so units do not stack on one doorway.

```text
Event: Breach phase starts
  Action: BreachLead.AI -> Coordination: Set Slot Position -> "bravo", "breachLane", "L", DoorLeft.X, DoorLeft.Y
  Action: BreachLead.AI -> Coordination: Set Slot Position -> "bravo", "breachLane", "C", DoorCenter.X, DoorCenter.Y
  Action: BreachLead.AI -> Coordination: Set Slot Position -> "bravo", "breachLane", "R", DoorRight.X, DoorRight.Y

Event: Breacher.AI -> On Task Started
  Condition: Breacher.AI -> Is Executing -> "breach"
  Action: Breacher.AI -> Coordination: Auto Assign Nearest Free Slot -> Breacher.UID, "bravo", "breachLane", Breacher.X, Breacher.Y, 600, 1.0
  // each breacher gets a distinct lane slot reservation

Event: Breacher -> On reached destination
  Condition: Breacher.AI -> Is Executing -> "breach"
  Action: Breacher.AI -> Coordination: Release Slot -> "bravo", "breachLane", Breacher.AI.AssignedSlotId("breachLane")
  Action: Breacher.AI -> Task: Mark Task Complete
  // frees lane for the next wave and advances task flow
```

Tip: Release slot on completion to keep chained assault waves from stalling on stale ownership.

#### 11. Multi-squad objective split

**Scenario:** Two squads attack different objectives and must keep objective state separated.

```text
Event: Mission phase starts
  Action: AlphaLead.AI -> Coordination: Set Squad State Key -> "alpha", "objective", "capture_north"
  Action: BravoLead.AI -> Coordination: Set Squad State Key -> "bravo", "objective", "capture_south"
  Action: AlphaLead.AI -> Coordination: Squad Plan Control -> "request", "alpha"
  Action: BravoLead.AI -> Coordination: Squad Plan Control -> "request", "bravo"
  // parallel objective routing without cross-squad state collision
```

Tip: Keep objective keys identical across squads so task logic can stay reusable.

#### 12. Temporary rally point override

**Scenario:** Squad gets hit by artillery and all members regroup to one safe rally slot set.

```text
Event: Artillery warning
  Action: Leader.AI -> Coordination: Set Squad State Key -> "alpha", "tactic", "regroup"
  Action: Leader.AI -> Coordination: Set Slot Position -> "alpha", "rally", "R1", SafeZone.X, SafeZone.Y
  Action: Leader.AI -> Coordination: Squad Plan Control -> "request", "alpha"

Event: Guard.AI -> On Task Started
  Condition: Guard.AI -> Is Executing -> "regroup"
  Action: Guard.AI -> Coordination: Auto Assign Nearest Free Slot -> Guard.UID, "alpha", "rally", Guard.X, Guard.Y, 1200, 1.2
```

Tip: Rally slots are easiest to maintain when they use short TTL and are refreshed by leader.

#### 13. Escort diamond formation

**Scenario:** Escort unit in center while four guards hold dedicated formation slots.

```text
Event: Escort starts
  Action: Lead.AI -> Coordination: Set Slot Position -> "escort1", "formation", "front", VIP.X, VIP.Y - 120
  Action: Lead.AI -> Coordination: Set Slot Position -> "escort1", "formation", "rear", VIP.X, VIP.Y + 120
  Action: Lead.AI -> Coordination: Set Slot Position -> "escort1", "formation", "left", VIP.X - 100, VIP.Y
  Action: Lead.AI -> Coordination: Set Slot Position -> "escort1", "formation", "right", VIP.X + 100, VIP.Y
```

Tip: Rewriting slot positions on a low interval keeps moving-formation cohesion stable.

#### 14. Ambush ring assignment

**Scenario:** Squad surrounds player by claiming ring slots around current player position.

```text
Event: Every 0.2 seconds
  Condition: Leader.AI -> Is Squad Leader -> Leader.UID
  Action: Leader.AI -> Coordination: Set Slot Position -> "alpha", "ring", "N", Player.X, Player.Y - 250
  Action: Leader.AI -> Coordination: Set Slot Position -> "alpha", "ring", "E", Player.X + 250, Player.Y
  Action: Leader.AI -> Coordination: Set Slot Position -> "alpha", "ring", "S", Player.X, Player.Y + 250
  Action: Leader.AI -> Coordination: Set Slot Position -> "alpha", "ring", "W", Player.X - 250, Player.Y
```

Tip: Pair ring slots with maxDistance limits so distant units do not overcommit.

#### 15. Staggered wave entry slots

**Scenario:** Reinforcement waves enter through separate spawn slots to avoid clumping.

```text
Event: Wave spawned
  Action: WaveLead.AI -> Coordination: Set Slot Position -> "wave3", "entry", "A", SpawnA.X, SpawnA.Y
  Action: WaveLead.AI -> Coordination: Set Slot Position -> "wave3", "entry", "B", SpawnB.X, SpawnB.Y
  Action: WaveLead.AI -> Coordination: Set Slot Position -> "wave3", "entry", "C", SpawnC.X, SpawnC.Y
  Action: Unit.AI -> Coordination: Auto Assign Nearest Free Slot -> Unit.UID, "wave3", "entry", Unit.X, Unit.Y, 9999, 2.0
```

Tip: Long TTL on entry slots helps late-spawn units avoid stealing a just-used entry point.

#### 16. Crossfire lane ownership

**Scenario:** Defenders hold alternating fire lanes and rotate lane ownership on reload cycle.

```text
Event: Defender reloading
  Action: Defender.AI -> Coordination: Release Slot -> "defense", "fireLane", Defender.AI.AssignedSlotId("fireLane")
  Action: Defender.AI -> Coordination: Set Squad State Key -> "defense", "laneOpen", 1

Event: Defender ready
  Action: Defender.AI -> Coordination: Auto Assign Nearest Free Slot -> Defender.UID, "defense", "fireLane", Defender.X, Defender.Y, 900, 1.0
```

Tip: A shared laneOpen key helps schedulers avoid assigning too many units to the same lane state.

#### 17. Priority target broadcast

**Scenario:** Leader marks a high-value target and all members replan toward it.

```text
Event: Sniper spotted
  Action: Leader.AI -> Coordination: Set Squad State Key -> "alpha", "priorityTargetUID", Sniper.UID
  Action: Leader.AI -> Coordination: Set Squad State Key -> "alpha", "tactic", "focus_fire"
  Action: Leader.AI -> Coordination: Request Squad Plans -> "alpha"
```

Tip: Use dedicated key names like priorityTargetUID to keep condition checks explicit in tasks.

#### 18. Retreat corridor slot chain

**Scenario:** Squad retreats through chained corridor slots in order to avoid collisions.

```text
Event: Retreat called
  Action: Leader.AI -> Coordination: Set Slot Position -> "alpha", "retreat", "P1", 1200, 400
  Action: Leader.AI -> Coordination: Set Slot Position -> "alpha", "retreat", "P2", 1400, 420
  Action: Leader.AI -> Coordination: Set Slot Position -> "alpha", "retreat", "P3", 1600, 450
  Action: Leader.AI -> Coordination: Squad Plan Control -> "request", "alpha"
```

Tip: Corridor slot IDs should encode order to simplify route selection logic.

#### 19. Dynamic objective handoff between squads

**Scenario:** Alpha finishes objective and hands pursuit objective to Bravo.

```text
Event: Alpha objective complete
  Action: AlphaLead.AI -> Coordination: Set Squad State Key -> "alpha", "objective", "hold"
  Action: BravoLead.AI -> Coordination: Set Squad State Key -> "bravo", "objective", "pursue"
  Action: BravoLead.AI -> Coordination: Invalidate Squad Plans -> "bravo"
  Action: BravoLead.AI -> Coordination: Request Squad Plans -> "bravo"
```

Tip: Explicit handoff events reduce race conditions from both squads writing the same objective intent.

#### 20. Global coordination throttle fallback

**Scenario:** Massive battle starts dropping frames, so coordination workload is reduced at runtime.

```text
Event: FPS < 50
  Action: AnyLeader.AI -> Coordination: Set Coordination Max Squads Per Update -> 2
  Action: AnyLeader.AI -> Coordination: Set Coordination Time Slice -> 0.0015

Event: FPS >= 58
  Action: AnyLeader.AI -> Coordination: Set Coordination Max Squads Per Update -> 6
  Action: AnyLeader.AI -> Coordination: Set Coordination Time Slice -> 0.003
```

Tip: Pair dynamic throttling with slightly larger planning intervals for low-priority squads.

### Coordination game use cases

1. **Stealth infiltration squads:** Leader writes noise source and followers reserve staggered investigate slots around the point.
2. **SWAT-style room clearing:** Breach team reserves lane slots, while rear cover squad reserves doorway hold positions.
3. **RTS control groups:** Per-squad state keys store objective and formation mode, with batched squad plan requests.
4. **MOBA minion waves:** Lane squads coordinate front, flank, and siege slot ownership to reduce path overlap.
5. **Boss encounter adds:** Add squads use shared target priority key and rotate reserve slots for safe attack windows.
6. **Survival horde director:** Horde squads dynamically switch tactic keys between surround, pressure, and fallback.
7. **Tactical stealth guards:** Courtyard and interior squads share alarm level and lock down different slot sets.
8. **Heist response teams:** Patrol squads reassign leaders when casualties occur and request coordinated intercept plans.
9. **Co-op extraction enemies:** Multiple squads reserve extraction perimeter slots to maintain 360-degree pressure.
10. **Sci-fi drone swarms:** Slot TTL keeps moving orbit slots fresh while preventing two drones from claiming same orbit point.
11. **Naval boarding parties:** Deck assault squads reserve boarding points and rotate slot ownership as ships drift.
12. **Zombie siege lanes:** Horde squads claim breach lanes on barricades so pressure spreads across defenses.
13. **Arena wave commanders:** Elite leader units push shared focus-target keys while minion squads hold assigned ring slots.
14. **Castle defense attackers:** Ladder, ram, and wall-climb squads reserve role slots to avoid unit pileups at one gate.
15. **Post-apoc scavenger factions:** Patrol squads switch shared objective keys between loot, ambush, and retreat based on alerts.
16. **Steampunk automaton platoons:** Mechanical squads use timed slot TTL to cycle firing lines and cooling positions.
17. **Space marine fireteams:** Two fireteams share corridor control by reserving leapfrog cover slots in sequence.
18. **Monster hunter packs:** Pack leader writes prey direction while flankers auto-assign nearest intercept slots.
19. **Cyberpunk gang turf fights:** Street squads claim alley choke slots and replan as soon as rival presence keys change.
20. **Fantasy raid mobs:** Mob squads reserve healer-guard and frontline slots so support units keep protected spacing.

## 10. Actions Reference

### Setup

| Action | Description |
|---|---|
| Set Agent Type | Changes this instance AI profile and requests replan. |
| Set Enabled | Turns behavior processing on or off for this instance. |
| Set Planning Interval | Sets periodic planning timing in seconds. |
| Set Planning Mode | Switches between reactive, deliberate, and hybrid replanning. |
| Set Processing Interval | Alias for planning interval, focused on performance tuning. |
| Set Task Timeout | Sets task auto-fail timeout in seconds. |

### World State

| Action | Description |
|---|---|
| Set World State | Writes one custom world-state key and value for this agent. |
| Clear World State Key | Clears one world-state key for this agent. |
| Set Patrol Point | Writes patrol point coordinates using indexed key naming. |
| Set Target | Writes target UID and position keys in one action. |
| Clear Target | Clears target keys and target visibility flag. |

### Signals

| Action | Description |
|---|---|
| Signal Target Seen | Sends visual stimulus and updates target and last-known position keys. |
| Signal Target Lost | Marks target visibility as off without changing alert directly. |
| Signal Sound Heard | Sends audio stimulus and records last sound data. |
| Signal Damaged | Sends damage stimulus, updates health and damage source keys, and replans immediately. |

### Task Control

| Action | Description |
|---|---|
| Mark Task Complete | Marks active primitive task complete and advances planning flow. |
| Mark Task Failed | Marks active primitive task failed and requests replanning path. |
| Request Replan | Forces immediate plan request regardless of interval timer. |
| Push Temporary Task | Interrupts with temporary task for duration in seconds or until cleared. |
| Clear Temporary Task | Ends temporary override early and returns to normal planning. |
| Pause | Pauses processing while preserving current state. |
| Resume | Resumes processing and requests immediate replan. |

## 11. Conditions Reference

| Condition | Description |
|---|---|
| Is Executing | True when current primitive task ID matches provided taskId. |
| Is Alert Tier | True when numeric alert tier matches selected tier. |
| Is In Combat | True when tier is combat. |
| Is Alerted | True when tier is alerted or combat. |
| Has Target | True when targetUID is non-zero and targetVisible is 1. |
| Is Paused | True when agent is paused by Task Control action. |
| Is Enabled | True when behavior processing is enabled. |
| Has Active Plan | True when current task or remaining plan exists. |
| Is In Temporary Task | True while temporary task override is active. |
| Has World State | True when given key exists in this agent world-state map. |

## 12. Expressions Reference

| Expression | Returns | Description |
|---|---|---|
| CurrentTask | string | Current primitive task ID. |
| PreviousTask | string | Previous task ID before current transition. |
| CompletedTask | string | Most recently completed task ID. |
| FailedTask | string | Most recently failed task ID. |
| RestoredTask | string | Task restored when temporary override ends. |
| AlertLevel | number | Current alert value in range 0 to 1. |
| AlertTier | number | Current alert tier index 0 to 3. |
| AlertTierName | string | Tier name text such as unaware, suspicious, alerted, combat. |
| PreviousTier | number | Tier index before last tier transition. |
| StimulusType | string | Last stimulus type processed by this instance. |
| StimulusX | number | Last stimulus X position. |
| StimulusY | number | Last stimulus Y position. |
| StimulusIntensity | number | Last stimulus intensity value. |
| WorldState(key) | any | Returns world-state value for key, or 0 if absent. |
| PlanLength | number | Remaining plan length including active task when available. |
| PlanTaskAtIndex(index) | string | Task ID at given plan index. |
| TargetUID | number | Target UID from world state. |
| LastKnownX | number | Last known target X from world state. |
| LastKnownY | number | Last known target Y from world state. |
| AgentType | string | Current agent type string for this instance. |
| Enabled | number | Returns 1 if enabled, otherwise 0. |

## 13. Triggers Reference

| Trigger | Description |
|---|---|
| On Task Started | Fires when a new primitive task becomes active. |
| On Task Completed | Fires when Mark Task Complete is called. |
| On Task Failed | Fires when Mark Task Failed is called or timeout fail occurs. |
| On Alert Changed | Fires when numeric alert crosses into a new tier. |
| On Stimulus Received | Fires when Signal action adds a stimulus for this instance. |
| On Temporary Task Started | Fires when temporary override begins. |
| On Temporary Task Ended | Fires when temporary override ends or is cleared. |
| On Plan Failed | Declared trigger condition. Current runtime version does not explicitly fire it. |

## 14. System Use Cases

### Registration System

One-line: Handles instance to manager lifecycle registration and deregistration.

#### Use case 1

**Scenario:** You spawn 30 enemies and want automatic manager registration.

```text
Event: Enemy -> On created
  Condition: Enemy.AI -> Is Enabled
  Action: Enemy.AI -> Setup: Set Agent Type -> "grunt"
  // with Auto Register true, registration happens automatically in onCreate
```

Tip: Keep Auto Register true unless you need delayed activation.

#### Use case 2

**Scenario:** You spawn a cutscene NPC that should not register yet.

```text
Event: Cutscene starts
  Action: NPC.AI -> Setup: Set Enabled -> false
  // keep processing off until gameplay starts

Event: Cutscene ends
  Action: NPC.AI -> Setup: Set Enabled -> true
  Action: NPC.AI -> Task: Request Replan
```

Tip: If Auto Register is false, add your own manager registration flow in your manager plugin events.

### Planning System

One-line: Schedules replanning by mode, urgency, and periodic interval in seconds.

#### Use case 1

**Scenario:** Boss enemy should replan instantly on any world-state change.

```text
Event: On start of layout
  Action: Boss.AI -> Setup: Set Planning Mode -> "reactive"
  Action: Boss.AI -> Setup: Set Planning Interval -> 0.2
```

Tip: Reactive mode ignores interval unless hybrid fallback logic is used.

#### Use case 2

**Scenario:** Crowd NPCs should update less often for performance.

```text
Event: On start of layout
  Action: Civilian.AI -> Setup: Set Planning Mode -> "deliberate"
  Action: Civilian.AI -> Setup: Set Planning Interval -> 2.5
```

Tip: Deliberate mode is usually the easiest scaling lever.

### World State System

One-line: Provides per-agent blackboard keys for task conditions and utility scoring.

#### Use case 1

**Scenario:** Patrol route is data-driven and should be editable in events.

```text
Event: On start of layout
  Action: Guard.AI -> World State: Set Patrol Point -> 0, 320, 200
  Action: Guard.AI -> World State: Set Patrol Point -> 1, 640, 200
  Action: Guard.AI -> World State: Set World State -> "patrolIndex", 0
```

Tip: Keep key names stable across AI JSON and event sheet.

#### Use case 2

**Scenario:** Target should be cleared after a search timeout.

```text
Event: Every 5.0 seconds
  Condition: Guard.AI -> Is Executing -> "search"
  Action: Guard.AI -> World State: Clear Target
```

Tip: Clear Target sets targetVisible to 0 and zeros target fields.

### Signal System

One-line: Converts gameplay sensory events into standardized AI stimuli.

#### Use case 1

**Scenario:** Hearing gunfire should alert nearby guards.

```text
Event: Weapon -> On fired
  Action: Guard.AI -> Signals: Signal Sound Heard -> Weapon.X, Weapon.Y, 0.8
```

Tip: Pair this with On Alert Changed for animation and audio feedback.

#### Use case 2

**Scenario:** Taking heavy damage should force immediate tactical response.

```text
Event: Guard -> On took damage
  Action: Guard.AI -> Signals: Signal Damaged -> DamageAmount, Attacker.X, Attacker.Y
```

Tip: Damage signal always triggers immediate plan request in runtime.

### Task Control System

One-line: Lets event sheet own completion, failure, pausing, and temporary overrides.

#### Use case 1

**Scenario:** Movement reached destination, so patrol task should complete.

```text
Event: Guard -> On reached destination
  Condition: Guard.AI -> Is Executing -> "patrol"
  Action: Guard.AI -> Task: Mark Task Complete
```

Tip: Completion events should happen at the exact gameplay endpoint.

#### Use case 2

**Scenario:** Actor should freeze for a short cutscene beat.

```text
Event: Dialogue line starts
  Action: Guard.AI -> Task: Push Temporary Task -> "idle", 2.0
```

Tip: Use Clear Temporary Task if scene ends early.

### Save and Restore System

One-line: Persists key AI runtime fields through save/load calls.

#### Use case 1

**Scenario:** Player saves mid-combat and reloads later.

```text
Event: System save
  // runtime stores alert level, task fields, and enabled state in _saveToJson

Event: System load
  // runtime restores planning properties and state in _loadFromJson
```

Tip: Manager-side data still needs manager plugin save/load support.

## 15. Game Use Cases

### 1. Minimum patrol enemy

**Scenario:** One enemy alternates patrol points with almost no setup.

```text
Event: Enemy.AI -> On Task Started
  Condition: Enemy.AI -> Is Executing -> "patrol"
  Action: Enemy -> MoveTo(Enemy.AI.WorldState("patrolPoint_0_x"), Enemy.AI.WorldState("patrolPoint_0_y"))

Event: Enemy -> On reached destination
  Action: Enemy.AI -> Task: Mark Task Complete
```

Note: Start by writing patrol points in On start of layout.

### 2. Basic chase on sight

**Scenario:** Enemy patrols until it sees player, then chases.

```text
Event: Every tick
  Condition: Enemy sees Player
  Action: Enemy.AI -> Signals: Signal Target Seen -> Player.UID, Player.X, Player.Y, 1.0

Event: Enemy.AI -> On Task Started
  Condition: Enemy.AI -> Is Executing -> "chase"
  Action: Enemy -> MoveTo(Player.X, Player.Y)
```

Note: Use Signal Target Lost when line-of-sight ends.

### 3. Sound-driven investigate behavior

**Scenario:** Enemy hears noise and investigates last sound location.

```text
Event: Rock -> On landed
  Action: Enemy.AI -> Signals: Signal Sound Heard -> Rock.X, Rock.Y, 0.7

Event: Enemy.AI -> On Task Started
  Condition: Enemy.AI -> Is Executing -> "investigate"
  Action: Enemy -> MoveTo(Enemy.AI.StimulusX, Enemy.AI.StimulusY)
```

Note: StimulusX and StimulusY reference latest signal.

### 4. Damage-reactive retreat

**Scenario:** Enemy retreats when heavily damaged.

```text
Event: Enemy -> On took damage
  Action: Enemy.AI -> Signals: Signal Damaged -> Damage, Attacker.X, Attacker.Y

Event: Enemy.AI -> On Task Started
  Condition: Enemy.AI -> Is Executing -> "retreat"
  Action: Enemy -> MoveTo(SafePoint.X, SafePoint.Y)
```

Note: Keep health key meaningful if manager logic uses it.

### 5. Hybrid stealth guard

**Scenario:** Guard uses hybrid mode for balanced responsiveness and performance.

```text
Event: On start of layout
  Action: Guard.AI -> Setup: Set Planning Mode -> "hybrid"
  Action: Guard.AI -> Setup: Set Planning Interval -> 1.0
```

Note: Tune urgency threshold in properties for how quickly hybrid spikes into immediate replans.

### 6. High-performance crowd civilians

**Scenario:** Many civilians run low-frequency planning only.

```text
Event: On start of layout
  Action: Civilian.AI -> Setup: Set Planning Mode -> "deliberate"
  Action: Civilian.AI -> Setup: Set Processing Interval -> 3.0
```

Note: Pair with Enabled toggles by camera region.

### 7. Off-screen AI culling

**Scenario:** Disable AI processing for distant enemies.

```text
Event: Every 0.25 seconds
  Condition: distance(Player, Enemy) > 2500
  Action: Enemy.AI -> Setup: Set Enabled -> false

Event: Every 0.25 seconds
  Condition: distance(Player, Enemy) <= 2500
  Action: Enemy.AI -> Setup: Set Enabled -> true
```

Note: Re-enable near player to avoid stale behavior.

### 8. Area-trigger wake-up

**Scenario:** Dormant guards activate when player enters zone.

```text
Event: Player enters TriggerArea
  Action: Guard.AI -> Setup: Set Enabled -> true
  Action: Guard.AI -> Task: Request Replan
```

Note: Start them disabled in properties for cheap idle scenes.

### 9. Cutscene freeze and resume

**Scenario:** AI pauses during dialogue then resumes.

```text
Event: Dialogue started
  Action: Enemy.AI -> Task: Pause

Event: Dialogue ended
  Action: Enemy.AI -> Task: Resume
```

Note: Resume requests immediate replan automatically.

### 10. Temporary forced emote

**Scenario:** NPC waves for 1.5 seconds during scripted moment.

```text
Event: Script cue
  Action: NPC.AI -> Task: Push Temporary Task -> "wave", 1.5
```

Note: On Temporary Task Ended is good for cleaning up animation state.

### 11. Fail stuck path and retry

**Scenario:** Path request fails and task should be retried with replan.

```text
Event: Enemy pathfinding failed
  Condition: Enemy.AI -> Is Executing -> "moveToCover"
  Action: Enemy.AI -> Task: Mark Task Failed
```

Note: Timeout plus explicit fail gives strong recovery behavior.

### 12. Dynamic role swap mid-match

**Scenario:** Normal enemy upgrades to elite behavior after alarm.

```text
Event: Alarm activated
  Action: Enemy.AI -> Setup: Set Agent Type -> "elite"
```

Note: Set Agent Type requests replan based on new network.

### 13. Patrol index in world state

**Scenario:** Route index tracked in blackboard rather than instance variables.

```text
Event: Enemy reached patrol point
  Action: Enemy.AI -> World State: Set World State -> "patrolIndex", Enemy.AI.WorldState("patrolIndex") + 1
  Action: Enemy.AI -> Task: Mark Task Complete
```

Note: This keeps event sheet cleaner across many instances.

### 14. Multi-guard alert propagation

**Scenario:** One guard spotting player alerts nearby allies.

```text
Event: Guard.AI -> On Stimulus Received
  Condition: Guard.AI.StimulusType = "visual"
  Action: OtherGuard.AI -> Signals: Signal Sound Heard -> Guard.X, Guard.Y, 0.6
```

Note: Use distance filtering to avoid global chain alerts.

### 15. Boss with instant reaction mode

**Scenario:** Boss must react immediately to any update.

```text
Event: On start of layout
  Action: Boss.AI -> Setup: Set Planning Mode -> "reactive"
  Action: Boss.AI -> Setup: Set Task Timeout -> 4.0
```

Note: Timeout protects against long stalled boss tasks.

### 16. Friendly companion behavior

**Scenario:** Companion follows player and reacts to combat sound.

```text
Event: Player moved far from Companion
  Action: Companion.AI -> World State: Set Target -> Player.UID, Player.X, Player.Y

Event: Gunshot heard
  Action: Companion.AI -> Signals: Signal Sound Heard -> Gun.X, Gun.Y, 0.9
```

Note: Same behavior can run ally and enemy logic by agentType.

### 17. Wave spawn auto-initialization

**Scenario:** Spawned enemies get consistent setup quickly.

```text
Event: EnemySpawner -> On spawn enemy
  Action: SpawnedEnemy.AI -> Setup: Set Enabled -> true
  Action: SpawnedEnemy.AI -> Setup: Set Planning Mode -> "hybrid"
  Action: SpawnedEnemy.AI -> Setup: Set Planning Interval -> 0.8
```

Note: Keep spawn setup in one event block for maintainability.

### 18. Search state after target loss

**Scenario:** Enemy loses sight and searches last known location.

```text
Event: LOS lost
  Action: Enemy.AI -> Signals: Signal Target Lost

Event: Enemy.AI -> On Task Started
  Condition: Enemy.AI -> Is Executing -> "search"
  Action: Enemy -> MoveTo(Enemy.AI.LastKnownX, Enemy.AI.LastKnownY)
```

Note: LastKnown values are written by Signal Target Seen.

### 19. Combat-only weapon logic gate

**Scenario:** Weapon should fire only in combat tier.

```text
Event: Every tick
  Condition: Enemy.AI -> Is In Combat
  Action: EnemyWeapon -> Fire
```

Note: Is Alerted can be used for broader high-alert logic.

### 20. AI debug overlay

**Scenario:** Show live task and alert values above each enemy.

```text
Event: Every tick
  Action: DebugText -> Set text -> Enemy.AI.CurrentTask & " | " & Enemy.AI.AlertTierName & " | " & Enemy.AI.Enabled
```

Note: Enabled expression returns 1 or 0 for quick UI checks.

### 21. Emergency disable during lag spike

**Scenario:** Temporarily lighten CPU load under frame stress.

```text
Event: FPS < 45
  Action: Enemy.AI -> Setup: Set Enabled -> false

Event: FPS >= 55
  Action: Enemy.AI -> Setup: Set Enabled -> true
```

Note: Use area or priority filters so critical enemies stay active.

### 22. Boss intro cinematic handoff

**Scenario:** Boss intro sequence ends and AI takes over seamlessly.

```text
Event: Intro cinematic finished
  Action: Boss.AI -> Setup: Set Enabled -> true
  Action: Boss.AI -> Task: Clear Temporary Task
  Action: Boss.AI -> Task: Request Replan
```

Note: This gives deterministic control over the handoff frame.

### Other game use cases

**Stealth games:** Use visual and audio signals to model guard awareness and layered suspicion states.

**Action RPGs:** Drive enemy archetypes by agentType while keeping one shared behavior implementation.

**Roguelikes:** Reconfigure planning interval and enabled state dynamically by room visibility.

**Tactical shooters:** Use world-state keys for cover selection, line priority, and squad target sharing.

**Survival horror:** Keep enemies deliberate while idle and reactive when stimulus intensity spikes.

**Open-world sandbox:** Disable distant AI by region and reactivate near player for stable frame times.

**Tower defense with creeps:** Use simple task IDs to switch lane movement, attack, and retreat phases.

**Top-down stealth puzzle:** Use Signal Target Lost and LastKnown positions for search loops.

**2D platform combat:** Trigger jump, flank, and ranged tasks based on blackboard keys set by level triggers.

**Metroidvania:** Enable AI only in active rooms and preserve behavior identity across revisits.

**Brawler arenas:** Use temporary tasks for taunts, stuns, and scripted phase transitions.

**Narrative adventure:** Pause and resume AI around dialogue and camera lock moments.

**City simulation:** Run citizens with long planning intervals and only activate local critical agents.

**Dungeon crawler:** Assign patrol points and alert behavior per room with world-state setup events.

**Extraction shooter:** Use high urgency thresholds for enemies that should react only to strong stimuli.

**Auto-battlers:** Mark task complete when animation finishes to keep action sequencing deterministic.

**Co-op survival:** Propagate sound signals from player actions to nearby enemy clusters.

**Strategy hybrids:** Separate agent types for scouts, defenders, and attackers while sharing signals pipeline.

**Boss-rush games:** Use reactive mode and short timeout values to keep bosses responsive.

**Wildlife AI systems:** Use sound and damage stimuli to trigger flee, defend, or return behaviors.

**Zombie horde games:** Keep background zombies deliberate and near-player zombies hybrid for scaling.

**Heist games:** Model guard patrol, investigate, alert, and combat loops from the same task framework.

## 16. Scripting (C3 Script / JavaScript)

Actions are now script-callable through ACE exposure (`expose = true` in action ACE files). This keeps one API source for both event sheets and script.

### Accessing the behavior

Behavior access comes from the behavior name in your project, not addon ID.

```js
const enemy = runtime.objects.Enemy.getFirstInstance();
const ai = enemy.behaviors.UtilityDrivenHTNAgent; // name depends on your project behavior name
```

### Calling actions from script

Use action method names directly on the behavior instance. The method name matches the ACE action file/method ID.

```js
ai.SetEnabled(true);
ai.SetPlanningMode("hybrid");
ai.SetPlanningInterval(1.0);
ai.SetTaskTimeout(8.0);
ai.SetWorldState("hasCover", 1);
ai.SignalTargetSeen(player.uid, player.x, player.y, 1.0);
ai.MarkTaskComplete();
```

Notes:
- Combo parameters use the combo key string in script, same as event-sheet values. Example: `"reactive"`, `"deliberate"`, `"hybrid"`.
- Parameter order in script is the same order shown in the ACE action parameter list.
- Coordination actions are available too (for example `AssignAgentToSquad`, `ReserveSlot`, `SetCoordinationEnabled`, `SquadPlanControl`).

### Reading state from script

Use public getters on the behavior instance.

```js
const state = {
  task: ai.CurrentTask(),
  previousTask: ai.PreviousTask(),
  alertLevel: ai.AlertLevel(),
  alertTierName: ai.AlertTierName(),
  hasTarget: ai.HasTarget(),
  enabled: ai.Enabled(),
  targetUid: ai.TargetUID(),
  lastKnownX: ai.LastKnownX(),
  lastKnownY: ai.LastKnownY(),
  planLength: ai.PlanLength(),
};
```

### Listening to events from script

This runtime provides on and off dispatch helpers on the behavior instance.

```js
const onStarted = () => {
  console.log("Task started:", ai.CurrentTask());
};

ai.on("OnTaskStarted", onStarted);
ai.on("OnAlertChanged", () => {
  console.log("New tier:", ai.AlertTierName());
});

// later cleanup
ai.off("OnTaskStarted", onStarted);
```

Supported trigger names in runtime flow:
- OnTaskStarted
- OnTaskCompleted
- OnTaskFailed
- OnAlertChanged
- OnStimulusReceived
- OnTemporaryTaskStarted
- OnTemporaryTaskEnded

### Looping patterns

Plan inspection can be done with PlanLength and PlanTaskAtIndex.

```js
const tasks = [];
for (let i = 0; i < ai.PlanLength(); i++) {
  tasks.push(ai.PlanTaskAtIndex(i));
}
console.log(tasks);
```

### Complete script example

```js
export function setupEnemyAI(runtime) {
  const enemyType = runtime.objects.Enemy;

  for (const enemy of enemyType.getAllInstances()) {
    const ai = enemy.behaviors.UtilityDrivenHTNAgent;

    ai.SetEnabled(true);
    ai.SetPlanningMode("hybrid");
    ai.SetPlanningInterval(0.75);
    ai.SetTaskTimeout(6.0);
    ai.SetWorldState("role", "guard");

    ai.on("OnTaskStarted", () => {
      const task = ai.CurrentTask();
      if (task === "patrol") {
        enemy.instVars.Speed = 120;
      }
      if (task === "chase") {
        enemy.instVars.Speed = 220;
      }
    });

    ai.on("OnStimulusReceived", () => {
      if (ai.StimulusType() === "audio") {
        ai.RequestReplan();
      }
    });

    // Optional coordination setup
    ai.AssignAgentToSquad(enemy.uid, "alpha");
    ai.SetSquadStateKey("alpha", "objective", "hold_line");
  }
}
```

## 17. Using This Addon With the Manager Companion

This behavior addon is designed to be the per-instance execution bridge for manager-driven planning. Use the companion integration pattern when you want manager-level intelligence and object-level execution to stay cleanly separated.

### Integration roles

- Manager companion addon: owns planning data, task networks, utility scoring, and global orchestration.
- This behavior addon: owns per-object lifecycle, world-state convenience writes, signals, task flow triggers, and event-sheet execution hooks.
- Gameplay events/scripts: own movement, animation, attack logic, and completion/failure reporting.

### Recommended setup contract

1. Place one manager instance on every layout where agents exist.
2. Add this behavior to each object that should participate in manager planning.
3. Keep Agent Type values aligned with registered manager task networks.
4. Feed gameplay context through behavior actions such as Set World State and Signals actions.
5. Execute active task behavior in event sheets when On Task Started fires.
6. Report outcome with Mark Task Complete or Mark Task Failed as soon as the primitive finishes.

### Data ownership checklist

- Write fast-changing per-agent keys through this behavior (for example target visibility, distances, cover flags).
- Keep shared squad intent in coordination state keys (for example tactic, objective, pressure side).
- Keep manager-side network/scorer definitions stable once gameplay starts.
- Treat task IDs and world-state key names as API contracts between manager, behavior, and event sheets.

### Event-sheet handshake pattern

```text
Event: On start of layout
  Action: Manager -> Register task network/scorers
  Action: Enemy.AI -> Setup: Set Agent Type -> "guard"
  Action: Enemy.AI -> Setup: Set Enabled -> true
  // manager and per-instance bridge are now aligned

Event: Every tick
  Action: Enemy.AI -> World State: Set World State -> "targetVisible", EnemyHasLOS ? 1 : 0
  Action: Enemy.AI -> World State: Set World State -> "distanceToTarget", distance(Enemy, Player)
  // keeps manager decisions supplied with fresh context

Event: Enemy.AI -> On Task Started
  Condition: Enemy.AI -> Is Executing -> "moveToCover"
  Action: Enemy -> MoveTo(CoverX, CoverY)
  // gameplay layer executes selected primitive

Event: Enemy -> On reached destination
  Condition: Enemy.AI -> Is Executing -> "moveToCover"
  Action: Enemy.AI -> Task: Mark Task Complete
  // closes the primitive task lifecycle
```

### Script handshake pattern

```js
export function bindAgent(runtime, enemy) {
  const ai = enemy.behaviors.UtilityDrivenHTNAgent;

  ai.SetEnabled(true);
  ai.SetAgentType("guard");
  ai.SetPlanningMode("hybrid");

  ai.on("OnTaskStarted", () => {
    const task = ai.CurrentTask();

    if (task === "attack") {
      enemy.instVars.AttackState = 1;
    }
  });

  ai.on("OnStimulusReceived", () => {
    if (ai.StimulusType() === "damage") {
      ai.RequestReplan();
    }
  });
}
```

### Coordination with companion squads

- Use Assign Agent To Squad at spawn time or role transitions.
- Use Set Squad State Key for shared tactical directives.
- Use Auto Assign Nearest Free Slot to prevent overlap in cover/flank positions.
- Use Squad Plan Control request after batching multiple tactical writes.

### Common integration mistakes

- Missing manager instance on layout: behavior suspends and logs warning.
- Agent Type mismatch with manager networks: plan quality degrades or tasks fail to resolve.
- Never marking task complete/failed: primitives stall and plans appear frozen.
- Overwriting squad keys every tick with unchanged values: can produce unnecessary replan churn.

## 18. Tips and Common Mistakes

- Always place the manager object on layouts where agents exist, or processing will suspend with warning.
- Do not rely on On Plan Failed trigger until manager and runtime explicitly emit it.
- Keep planning interval values practical. Extremely low seconds on many instances can hurt frame rate.
- Call Mark Task Complete or Mark Task Failed from your gameplay events. Planning does not auto-complete primitive actions.
- Use Enabled for coarse performance control and Pause for temporary logic freeze while keeping agent active.
- Signal Target Lost only changes targetVisible. If you need full cleanup, call Clear Target.
- Keep world-state key naming consistent across event sheet logic and manager task definitions.
- If you use temporary tasks, clear or finish them explicitly during scripted transitions.
- Remember this behavior is per-instance. Global AI decisions should still live in the manager plugin.
