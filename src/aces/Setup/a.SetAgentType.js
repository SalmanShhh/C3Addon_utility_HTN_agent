export const config = {
  listName: "Setup: Set Agent Type",
  displayText: "Set agent type to {0}",
  description: "Switches this object to another AI profile and replans. Use case: turn a civilian into a guard during an alarm.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    {
      id: "agentType",
      name: "Agent Type",
      desc: "Task network id to use for this instance.",
      type: "string",
      initialValue: '"default"',
    },
  ],
};

export const expose = true;

export default function (agentType) {
  this._setAgentType(agentType);
}
