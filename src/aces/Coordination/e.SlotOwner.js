export const config = {
  returnType: "number",
  description: "Returns current owner UID for a slot, or 0 if free.",
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "squadId", name: "Squad ID", desc: "Squad id.", type: "string" },
    { id: "slotType", name: "Slot Type", desc: "Slot type name.", type: "string" },
    { id: "slotId", name: "Slot ID", desc: "Slot id.", type: "string" },
  ],
};

export const expose = false;

export default function (squadId, slotType, slotId) {
  return this.SlotOwner(squadId, slotType, slotId);
}
