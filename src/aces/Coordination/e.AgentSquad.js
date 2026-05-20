export const config = {
  returnType: "string",
  description: "Returns the squad id for an agent UID.",
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Agent instance UID.", type: "number" },
  ],
};

export const expose = false;

export default function (agentUID) {
  return this.AgentSquad(agentUID);
}
