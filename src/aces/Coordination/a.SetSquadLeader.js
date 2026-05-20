export const config = {
  listName: "Coordination: Set Squad Leader",
  displayText: "Set squad {0} leader to agent UID {1}",
  description: "Sets one leader UID for the squad.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "squadId", name: "Squad ID", desc: "Squad id.", type: "string", initialValue: '"alpha"' },
    { id: "agentUID", name: "Agent UID", desc: "Leader UID.", type: "number", initialValue: "0" },
  ],
};

export const expose = true;

export default function (squadId, agentUID) {
  this._setSquadLeader(squadId, agentUID);
}
