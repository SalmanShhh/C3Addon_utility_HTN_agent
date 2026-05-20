export const config = {
  returnType: "string",
  description: "Returns slot id assigned to an agent for the slot type.",
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Agent instance UID.", type: "number" },
    { id: "slotType", name: "Slot Type", desc: "Slot type name.", type: "string" },
  ],
};

export const expose = false;

export default function (agentUID, slotType) {
  return this.AssignedSlotId(agentUID, slotType);
}
