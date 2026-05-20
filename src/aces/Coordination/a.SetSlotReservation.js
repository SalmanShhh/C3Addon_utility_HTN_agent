export const config = {
  listName: "Coordination: Set Slot Reservation",
  displayText: "Set slot reservation mode {0} for squad {1}, type {2}, slot {3}, agent UID {4}, ttl {5} sec",
  description: "Combined slot reservation control for reserve or release modes.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    {
      id: "mode",
      name: "Mode",
      desc: "Reservation operation mode.",
      type: "combo",
      initialValue: "reserve",
      items: [{ reserve: "Reserve" }, { release: "Release" }],
    },
    { id: "squadId", name: "Squad ID", desc: "Squad id.", type: "string", initialValue: '"alpha"' },
    { id: "slotType", name: "Slot Type", desc: "Slot type name.", type: "string", initialValue: '"coverSlot"' },
    { id: "slotId", name: "Slot ID", desc: "Slot id.", type: "string", initialValue: '"A1"' },
    { id: "agentUID", name: "Agent UID", desc: "Owner agent UID when reserving.", type: "number", initialValue: "0" },
    { id: "ttlSec", name: "TTL (sec)", desc: "Reservation lifetime in seconds.", type: "number", initialValue: "1" },
  ],
};

export const expose = true;

export default function (mode, squadId, slotType, slotId, agentUID, ttlSec) {
  this._setSlotReservation(mode, squadId, slotType, slotId, agentUID, ttlSec);
}
