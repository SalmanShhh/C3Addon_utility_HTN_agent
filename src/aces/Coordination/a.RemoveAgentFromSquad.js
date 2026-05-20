export const config = {
  listName: "Coordination: Remove Agent From Squad",
  displayText: "Remove agent UID {0} from squad",
  description: "Removes an agent from its current squad and releases owned slots.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Agent instance UID.", type: "number", initialValue: "0" },
  ],
};

export const expose = true;

export default function (agentUID) {
  this._removeAgentFromSquad(agentUID);
}
