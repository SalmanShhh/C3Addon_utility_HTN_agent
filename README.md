<img src="./src/icon.svg" width="100" /><br>
# Utility-Driven HTN (Hierarchical Task Network) Agent
<i>Give any object smart AI, attach this behavior and it automatically registers with the HTN Manager, runs utility-scored planning, tracks alert tiers, reacts to sight/sound/damage signals, and fires clean event-sheet triggers for each task. No AI boilerplate, no per-instance glue code. Supports squads, slot-based tactical coordination, temporary task overrides, save/load, and performance scaling for any game size.</i> <br>
### Version 1.0.0.1

[<img src="https://placehold.co/200x50/4493f8/FFF?text=Download&font=montserrat" width="200"/>](https://github.com/SalmanShhh/C3Addon_utility_driven_htn_hierarchical_task_network_agent/releases/download/salmanshh_DHTN_Agent-1.0.0.1.c3addon/salmanshh_DHTN_Agent-1.0.0.1.c3addon)
<br>
<sub> [See all releases](https://github.com/SalmanShhh/C3Addon_utility_driven_htn_hierarchical_task_network_agent/releases) </sub> <br>

---
<b><u>Author:</u></b> SalmanShh <br>
<sub>Made using [CAW](https://marketplace.visualstudio.com/items?itemName=skymen.caw) </sub><br>

## Table of Contents
- [Usage](#usage)
- [Examples Files](#examples-files)
- [Properties](#properties)
- [Actions](#actions)
- [Conditions](#conditions)
- [Expressions](#expressions)
---
## Usage
To build the addon, run the following commands:

```
npm i
npm run build
```

To run the dev server, run

```
npm i
npm run dev
```

## Examples Files

---
## Properties
| Property Name | Description | Type |
| --- | --- | --- |
| Agent Type | Selects which AI network this object uses. Use case: assign "grunt" to basic enemies and "boss" to bosses. | text |
| Planning Mode | Sets when planning runs. Use case: choose deliberate for many background NPCs to reduce CPU usage. | combo |
| Planning Interval (sec) | Time in seconds between periodic replans. Use case: set 0.5 for responsive guards, 2.0 for idle crowds. | float |
| Urgency Threshold | Urgency needed to replan instantly in hybrid mode. Use case: keep low for stealth games that need quick reactions. | float |
| Initial Alert Level | Starting alert value from 0 to 1. Use case: begin ambush enemies at 0.6 so they start suspicious. | float |
| Task Timeout (sec) | Auto-fails a stuck task after this many seconds. Use case: set 8 to recover if pathing gets blocked. | float |
| Auto Register | Registers with the manager on spawn. Use case: disable for cutscene actors you register later by events. | check |
| Enabled | Turns this behavior processing on or off. Use case: disable far-away enemies to save performance. | check |
| Debug Label | Optional name shown in warnings. Use case: set "Guard_North" to quickly identify problem agents. | text |


---
## Actions
| Action | Description | Params
| --- | --- | --- |
| Coordination: Assign Agent To Squad | Adds an agent to a squad and syncs squad world-state keys. | Agent UID             *(number)* <br>Squad ID             *(string)* <br> |
| Coordination: Auto Assign Nearest Free Slot | Finds nearest free slot and reserves it for the agent. | Agent UID             *(number)* <br>Squad ID             *(string)* <br>Slot Type             *(string)* <br>Agent X             *(number)* <br>Agent Y             *(number)* <br>Max Distance             *(number)* <br>TTL (sec)             *(number)* <br> |
| Coordination: Clear Squad State Key | Clears one shared squad state key. | Squad ID             *(string)* <br>Key             *(string)* <br> |
| Coordination: Invalidate Squad Plans | Marks squad plans stale so they are replanned on coordination pass. | Squad ID             *(string)* <br> |
| Coordination: Load Slot Positions From JSON | Imports slot coordinates from a JSON array string. | Squad ID             *(string)* <br>Slot Type             *(string)* <br>Slots JSON             *(string)* <br> |
| Coordination: Load Slot Positions From World State Key | Loads JSON slot positions from a world-state key and imports them. | Squad ID             *(string)* <br>Slot Type             *(string)* <br>Scope             *(combo)* <br>Key             *(string)* <br>Agent UID             *(number)* <br> |
| Coordination: Release Slot | Releases a slot reservation if present. | Squad ID             *(string)* <br>Slot Type             *(string)* <br>Slot ID             *(string)* <br> |
| Coordination: Remove Agent From Squad | Removes an agent from its current squad and releases owned slots. | Agent UID             *(number)* <br> |
| Coordination: Request Squad Plans | Requests immediate plan updates for all squad members. | Squad ID             *(string)* <br> |
| Coordination: Reserve Slot | Reserves a squad slot for an agent if free or expired. | Squad ID             *(string)* <br>Slot Type             *(string)* <br>Slot ID             *(string)* <br>Agent UID             *(number)* <br>TTL (sec)             *(number)* <br> |
| Coordination: Set Auto Release On Deregister | Controls whether owned slots are auto-released when agents are deregistered. | Enabled             *(boolean)* <br> |
| Coordination: Set Coordination Enabled | Enables or disables squad coordination processing globally. | Enabled             *(boolean)* <br> |
| Coordination: Set Max Squads Per Update | Caps number of squads processed per coordination pass. 0 means all. | Count             *(number)* <br> |
| Coordination: Set Slot Default TTL | Sets default reservation TTL in seconds for slot operations. | Seconds             *(number)* <br> |
| Coordination: Set Coordination Time Slice | Sets optional time slice cap per coordination pass. 0 disables slice. | Seconds             *(number)* <br> |
| Coordination: Set Coordination Update Interval | Sets global coordination update interval in seconds. | Seconds             *(number)* <br> |
| Coordination: Set Slot Position | Stores world position for a squad slot. | Squad ID             *(string)* <br>Slot Type             *(string)* <br>Slot ID             *(string)* <br>X             *(number)* <br>Y             *(number)* <br> |
| Coordination: Set Slot Reservation | Combined slot reservation control for reserve or release modes. | Mode             *(combo)* <br>Squad ID             *(string)* <br>Slot Type             *(string)* <br>Slot ID             *(string)* <br>Agent UID             *(number)* <br>TTL (sec)             *(number)* <br> |
| Coordination: Set Squad Leader | Sets one leader UID for the squad. | Squad ID             *(string)* <br>Agent UID             *(number)* <br> |
| Coordination: Set Squad State Key | Writes one shared squad state key and mirrors it to squad members. | Squad ID             *(string)* <br>Key             *(string)* <br>Value             *(any)* <br> |
| Coordination: Squad Plan Control | Combined squad plan control for invalidate, request, or both. | Mode             *(combo)* <br>Squad ID             *(string)* <br> |
| Setup: Set Agent Type | Switches this object to another AI profile and replans. Use case: turn a civilian into a guard during an alarm. | Agent Type             *(string)* <br> |
| Setup: Set Enabled | Turns this agent processing on or off. Use case: disable distant enemies to save CPU. | Enabled             *(boolean)* <br> |
| Setup: Set Planning Interval | Sets periodic planning time in seconds. Use case: increase to 2 seconds for background NPCs to reduce CPU. | Seconds             *(number)* <br> |
| Setup: Set Planning Mode | Changes when this agent replans. Use case: use reactive mode for bosses that must react instantly. | Mode             *(combo)* <br> |
| Setup: Set Processing Interval | Sets how often periodic planning runs in seconds. Use case: raise to 2 seconds for low-priority NPCs. | Seconds             *(number)* <br> |
| Setup: Set Task Timeout | Sets auto-fail timeout in seconds for stuck tasks. Use case: recover agents stuck behind obstacles. | Seconds             *(number)* <br> |
| Signals: Signal Damaged | Reports damage and updates related world-state values. Use case: trigger retreat behavior when health drops. | Damage             *(number)* <br>From X             *(number)* <br>From Y             *(number)* <br> |
| Signals: Signal Sound Heard | Reports a sound event for hearing reactions. Use case: alert nearby guards when player makes noise. | X             *(number)* <br>Y             *(number)* <br>Intensity             *(number)* <br> |
| Signals: Signal Target Lost | Marks target as no longer visible. Use case: call when line-of-sight breaks. |  |
| Signals: Signal Target Seen | Reports visual contact and updates target data. Use case: call when enemy raycast detects player. | Target UID             *(number)* <br>X             *(number)* <br>Y             *(number)* <br>Confidence             *(number)* <br> |
| Task: Clear Temporary Task | Stops temporary override and returns to normal planning. Use case: end cutscene idle behavior early. |  |
| Task: Mark Task Complete | Marks current task as done so plan can continue. Use case: call after reaching a patrol waypoint. |  |
| Task: Mark Task Failed | Marks current task as failed to force replanning. Use case: call when pathfinding cannot reach target. |  |
| Task: Pause | Pauses AI updates for this object. Use case: freeze enemies during pause menu or dialogue. |  |
| Task: Push Temporary Task | Runs a one-off task before returning to normal plan. Use case: force "idle" during a short cutscene. | Task ID             *(string)* <br>Duration (sec)             *(number)* <br> |
| Task: Request Replan | Requests an immediate replan now. Use case: call right after a major world-state change. |  |
| Task: Resume | Resumes AI updates and replans immediately. Use case: wake enemies when player enters the area. |  |
| World State: Clear Target | Removes current target data for this agent. Use case: clear chase data after the player escapes. |  |
| World State: Clear World State Key | Deletes one world-state key on this agent. Use case: clear a temporary flag like "heardNoise". | Key             *(string)* <br> |
| World State: Set Patrol Point | Stores a patrol waypoint in world state. Use case: set patrol routes at layout start from events. | Index             *(number)* <br>X             *(number)* <br>Y             *(number)* <br> |
| World State: Set Target | Sets target UID and position in one step. Use case: lock onto player when entering attack range. | Target UID             *(number)* <br>X             *(number)* <br>Y             *(number)* <br> |
| World State: Set World State | Writes any custom world-state key for this agent. Use case: set "hasCover" after finding cover. | Key             *(string)* <br>Value             *(any)* <br> |


---
## Conditions
| Condition | Description | Params
| --- | --- | --- |
| Is Agent In Squad | True if the agent is currently assigned to the given squad. | Agent UID *(number)* <br>Squad ID *(string)* <br> |
| Is Slot Free | True if the slot is not currently reserved by a live owner. | Squad ID *(string)* <br>Slot Type *(string)* <br>Slot ID *(string)* <br> |
| Is Squad Leader | True if the agent is the current leader of its squad. | Agent UID *(number)* <br> |
| On Slot Released | Triggered when a slot reservation is released or expires. |  |
| On Slot Reserved | Triggered when a slot reservation succeeds. |  |
| On Squad Membership Changed | Triggered when an agent joins or leaves a squad. |  |
| On Squad State Changed | Triggered when a squad shared state key is updated or cleared. |  |
| On Alert Changed | Runs when alert tier changes. Use case: switch sprite animation from patrol to combat. |  |
| On Plan Failed | Runs when no valid plan is found. Use case: force a safe fallback task like idle. |  |
| On Stimulus Received | Runs when a signal is received. Use case: play an exclamation sound when enemy hears noise. |  |
| On Task Completed | Runs after task completion is marked. Use case: start movement for the next task. |  |
| On Task Failed | Runs after task failure is marked. Use case: play a failed path reaction before retry. |  |
| On Task Started | Runs when a new primitive task starts. Use case: branch event logic by CurrentTask. |  |
| On Temporary Task Ended | Runs when temporary override ends. Use case: resume normal patrol animation. |  |
| On Temporary Task Started | Runs when temporary override starts. Use case: force a guard to hold position briefly. |  |
| Has Active Plan | True when this agent still has work to do. Use case: skip idle logic while a plan is active. |  |
| Has Target | True when a visible target is set. Use case: only run chase movement when target exists. |  |
| Has World State | True if a world-state key exists. Use case: check if patrol data was set before using it. | Key *(string)* <br> |
| Is Alerted | True for alerted or combat tiers. Use case: enable weapon behavior only at high alert. |  |
| Is Alert Tier | True when alert tier matches selected value. Use case: run separate logic for suspicious vs combat. | Tier *(combo)* <br> |
| Is Enabled | True when this behavior is processing. Use case: skip AI movement events when disabled. |  |
| Is Executing | True when current task matches the id. Use case: run patrol code only during task "patrol". | Task ID *(string)* <br> |
| Is In Combat | True only at combat tier. Use case: start firing logic only when fully engaged. |  |
| Is In Temporary Task | True while temporary task override is active. Use case: block normal task completion events during cutscenes. |  |
| Is Paused | True when Pause was applied. Use case: avoid sending duplicate pause commands. |  |


---
## Expressions
| Expression | Description | Return Type | Params
| --- | --- | --- | --- |
| AgentSquad | Returns the squad id for an agent UID. | string | Agent UID *(number)* <br> | 
| AssignedSlotId | Returns slot id assigned to an agent for the slot type. | string | Agent UID *(number)* <br>Slot Type *(string)* <br> | 
| CoordinationEnabled | Returns 1 if coordination processing is enabled, else 0. | number |  | 
| CoordinationIntervalSec | Returns coordination update interval in seconds. | number |  | 
| CoordinationPassesThisTick | Returns number of coordination squads processed in last pass. | number |  | 
| CoordinationTimeSliceSec | Returns coordination time slice cap in seconds. | number |  | 
| CountSquadAgents | Returns member count for a squad. | number | Squad ID *(string)* <br> | 
| CountSquads | Returns number of active squads. | number |  | 
| ExpiredSlotsReleased | Returns total number of expired slot releases. | number |  | 
| GetSquadAgentUIDByIndex | Returns squad member UID at a zero-based index. | number | Squad ID *(string)* <br>Index *(number)* <br> | 
| SlotOwner | Returns current owner UID for a slot, or 0 if free. | number | Squad ID *(string)* <br>Slot Type *(string)* <br>Slot ID *(string)* <br> | 
| SquadLeader | Returns leader UID for a squad. | number | Squad ID *(string)* <br> | 
| SquadStateValue | Returns one squad state value by key. | any | Squad ID *(string)* <br>Key *(string)* <br> | 
| AgentType | Returns this agent type id. Use case: show current AI profile in a debug panel. | string |  | 
| AlertLevel | Returns alert level from 0 to 1. Use case: drive UI color intensity for enemy awareness. | number |  | 
| AlertTier | Returns alert tier index. Use case: switch behavior branches with a numeric tier check. | number |  | 
| AlertTierName | Returns alert tier name text. Use case: print "suspicious" or "combat" to debug text. | string |  | 
| CompletedTask | Returns last completed task id. Use case: log finished tasks for tuning AI flow. | string |  | 
| CurrentTask | Returns current task id. Use case: route event-sheet logic by active task name. | string |  | 
| Enabled | Returns 1 if enabled, else 0. Use case: show current AI processing state in a debug text object. | number |  | 
| FailedTask | Returns last failed task id. Use case: track tasks that frequently fail and need redesign. | string |  | 
| LastKnownX | Returns last known target X. Use case: move to investigate where the player was seen. | number |  | 
| LastKnownY | Returns last known target Y. Use case: move to investigate where the player was seen. | number |  | 
| PlanLength | Returns remaining task count. Use case: detect empty plans and request fallback behavior. | number |  | 
| PlanTaskAtIndex | Returns task id at a plan index. Use case: preview next task for debugging. | string | Index *(number)* <br> | 
| PreviousTask | Returns previous task id. Use case: detect transitions like patrol to chase. | string |  | 
| PreviousTier | Returns previous alert tier index. Use case: trigger one-time effects on tier changes. | number |  | 
| RestoredTask | Returns task restored after temporary override. Use case: continue a paused patrol task cleanly. | string |  | 
| StimulusIntensity | Returns latest stimulus intensity. Use case: scale reaction strength from weak to strong. | number |  | 
| StimulusType | Returns latest stimulus type text. Use case: handle sound and damage with different responses. | string |  | 
| StimulusX | Returns latest stimulus X position. Use case: face toward the source of a sound. | number |  | 
| StimulusY | Returns latest stimulus Y position. Use case: move to inspect where damage came from. | number |  | 
| TargetUID | Returns current target UID. Use case: fetch target instance for aim or movement logic. | number |  | 
| WorldState | Reads a world-state value by key. Use case: check custom flags like "isCoverAvailable" in events. | any | Key *(string)* <br> | 


---
## Changelog

**1.0.0.1**

**1.0.0.0**

**0.0.0.0**
- **Added:** Initial release.
