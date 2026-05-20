export const config = {
  listName: "Coordination: Initialize Slot Builder",
  displayText: "Initialize slot builder for squad {0}, type {1}",
  description: "Starts a new slot collection. Use with Add Slot To Builder then commit with Load Slot Set.",
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
  this._initializeSlotBuilder(String(squadId ?? ""), String(slotType ?? ""));
}
