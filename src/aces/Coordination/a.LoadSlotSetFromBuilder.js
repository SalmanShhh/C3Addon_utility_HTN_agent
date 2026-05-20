export const config = {
  listName: "Coordination: Load Slot Set From Builder",
  displayText: "Load slot set to coordination for squad {0}, type {1}",
  description: "Commits all slots added via Add Slot To Builder to coordination.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "squadId", name: "Squad ID", desc: "Squad identifier.", type: "string", initialValue: '"alpha"' },
    { id: "slotType", name: "Slot Type", desc: "Slot type name.", type: "string", initialValue: '"coverSlot"' },
  ],
};

export const expose = true;

export default function (squadId, slotType) {
  this._loadSlotSetFromBuilder(String(squadId ?? ""), String(slotType ?? ""));
}
