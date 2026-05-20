export const config = {
  listName: "Coordination: Assign Agent To Squad",
  displayText: "Assign agent UID {0} to squad {1}",
  description: "Adds an agent to a squad and syncs squad world-state keys.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Agent instance UID.", type: "number", initialValue: "0" },
    { id: "squadId", name: "Squad ID", desc: "Target squad id.", type: "string", initialValue: '"alpha"' },
  ],
};

export const expose = true;

export default function (agentUID, squadId) {
  this._assignAgentToSquad(agentUID, squadId);
}
