export const config = {
  listName: "Is Slot Free",
  displayText: "Is slot {2} of type {1} in squad {0} free",
  description: "True if the slot is not currently reserved by a live owner.",
  isTrigger: false,
  isInvertible: true,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "squadId", name: "Squad ID", desc: "Squad id.", type: "string", initialValue: '"alpha"' },
    { id: "slotType", name: "Slot Type", desc: "Slot type name.", type: "string", initialValue: '"coverSlot"' },
    { id: "slotId", name: "Slot ID", desc: "Slot id.", type: "string", initialValue: '"A1"' },
  ],
};

export const expose = false;

export default function (squadId, slotType, slotId) {
  return this.IsSlotFree(squadId, slotType, slotId);
}
