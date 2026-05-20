export const config = {
  listName: "Coordination: Set Slot Position",
  displayText: "Set slot {2} of type {1} in squad {0} to ({3}, {4})",
  description: "Stores world position for a squad slot.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "squadId", name: "Squad ID", desc: "Squad id.", type: "string", initialValue: '"alpha"' },
    { id: "slotType", name: "Slot Type", desc: "Slot type name.", type: "string", initialValue: '"coverSlot"' },
    { id: "slotId", name: "Slot ID", desc: "Slot id.", type: "string", initialValue: '"A1"' },
    { id: "x", name: "X", desc: "Slot x position.", type: "number", initialValue: "0" },
    { id: "y", name: "Y", desc: "Slot y position.", type: "number", initialValue: "0" },
  ],
};

export const expose = true;

export default function (squadId, slotType, slotId, x, y) {
  this._setSlotPosition(squadId, slotType, slotId, x, y);
}
