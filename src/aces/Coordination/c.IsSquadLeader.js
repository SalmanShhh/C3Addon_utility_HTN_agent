export const config = {
  listName: "Is Squad Leader",
  displayText: "Is agent UID {0} squad leader",
  description: "True if the agent is the current leader of its squad.",
  isTrigger: false,
  isInvertible: true,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Agent instance UID.", type: "number", initialValue: "0" },
  ],
};

export const expose = false;

export default function (agentUID) {
  return this.IsSquadLeader(agentUID);
}
