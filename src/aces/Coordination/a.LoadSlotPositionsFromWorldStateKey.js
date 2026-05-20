export const config = {
  listName: "Coordination: Load Slot Positions From World State Key",
  displayText: "Load slot positions for type {1} in squad {0} from world key {3} using scope {2} and UID {4}",
  description: "Loads JSON slot positions from a world-state key and imports them.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "squadId", name: "Squad ID", desc: "Squad id.", type: "string", initialValue: '"alpha"' },
    { id: "slotType", name: "Slot Type", desc: "Slot type name.", type: "string", initialValue: '"coverSlot"' },
    {
      id: "scope",
      name: "Scope",
      desc: "Source scope for world-state lookup.",
      type: "combo",
      initialValue: "agent",
      items: [{ agent: "Agent UID" }, { local: "This instance" }],
    },
    { id: "key", name: "Key", desc: "World-state key storing JSON.", type: "string", initialValue: '"slotData"' },
    { id: "agentUID", name: "Agent UID", desc: "Source agent UID when scope is Agent UID.", type: "number", initialValue: "0" },
  ],
};

export const expose = true;

export default function (squadId, slotType, scope, key, agentUID) {
  this._loadSlotPositionsFromWorldStateKey(squadId, slotType, scope, key, agentUID);
}
