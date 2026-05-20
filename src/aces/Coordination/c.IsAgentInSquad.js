export const config = {
  listName: "Is Agent In Squad",
  displayText: "Is agent UID {0} in squad {1}",
  description: "True if the agent is currently assigned to the given squad.",
  isTrigger: false,
  isInvertible: true,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Agent instance UID.", type: "number", initialValue: "0" },
    { id: "squadId", name: "Squad ID", desc: "Squad id.", type: "string", initialValue: '"alpha"' },
  ],
};

export const expose = false;

export default function (agentUID, squadId) {
  return this.IsAgentInSquad(agentUID, squadId);
}
