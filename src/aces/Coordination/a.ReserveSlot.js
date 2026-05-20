export const config = {
  listName: "Coordination: Reserve Slot",
  displayText: "Reserve slot {2} of type {1} in squad {0} for agent UID {3} with ttl {4} sec",
  description: "Reserves a squad slot for an agent if free or expired.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "squadId", name: "Squad ID", desc: "Squad id.", type: "string", initialValue: '"alpha"' },
    { id: "slotType", name: "Slot Type", desc: "Slot type name.", type: "string", initialValue: '"coverSlot"' },
    { id: "slotId", name: "Slot ID", desc: "Slot id.", type: "string", initialValue: '"A1"' },
    { id: "agentUID", name: "Agent UID", desc: "Owner agent UID.", type: "number", initialValue: "0" },
    { id: "ttlSec", name: "TTL (sec)", desc: "Reservation lifetime in seconds.", type: "number", initialValue: "1" },
  ],
};

export const expose = true;

export default function (squadId, slotType, slotId, agentUID, ttlSec) {
  this._reserveSlot(squadId, slotType, slotId, agentUID, ttlSec);
}
