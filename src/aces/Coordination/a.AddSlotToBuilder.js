export const config = {
  listName: "Coordination: Add Slot To Builder",
  displayText: "Add slot {2} at ({3}, {4}) to builder for squad {0}, type {1}",
  description: "Adds one slot to the current builder. Call Initialize Slot Builder first.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "squadId", name: "Squad ID", desc: "Squad identifier.", type: "string", initialValue: '"alpha"' },
    { id: "slotType", name: "Slot Type", desc: "Slot type name.", type: "string", initialValue: '"coverSlot"' },
    { id: "slotId", name: "Slot ID", desc: "Unique slot identifier.", type: "string", initialValue: '"A1"' },
    { id: "x", name: "X", desc: "Slot world X position.", type: "number", initialValue: "0" },
    { id: "y", name: "Y", desc: "Slot world Y position.", type: "number", initialValue: "0" },
  ],
};

export const expose = true;

export default function (squadId, slotType, slotId, x, y) {
  this._addSlotToBuilder(
    String(squadId ?? ""),
    String(slotType ?? ""),
    String(slotId ?? ""),
    Number(x) || 0,
    Number(y) || 0
  );
}
