export const config = {
  listName: "Coordination: Release Slot",
  displayText: "Release slot {2} of type {1} in squad {0}",
  description: "Releases a slot reservation if present.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "squadId", name: "Squad ID", desc: "Squad id.", type: "string", initialValue: '"alpha"' },
    { id: "slotType", name: "Slot Type", desc: "Slot type name.", type: "string", initialValue: '"coverSlot"' },
    { id: "slotId", name: "Slot ID", desc: "Slot id.", type: "string", initialValue: '"A1"' },
  ],
};

export const expose = true;

export default function (squadId, slotType, slotId) {
  this._releaseSlot(squadId, slotType, slotId);
}
