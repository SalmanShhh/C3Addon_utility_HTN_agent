export const config = {
  listName: "Setup: Set Enabled",
  displayText: "Set enabled to {0}",
  description: "Turns this agent processing on or off. Use case: disable distant enemies to save CPU.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    {
      id: "enabled",
      name: "Enabled",
      desc: "True to process AI, false to stop processing.",
      type: "boolean",
      initialValue: "true",
    },
  ],
};

export const expose = true;

export default function (enabled) {
  this._setEnabled(enabled);
}
