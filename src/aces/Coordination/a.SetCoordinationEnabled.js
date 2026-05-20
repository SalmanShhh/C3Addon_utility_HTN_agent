export const config = {
  listName: "Coordination: Set Coordination Enabled",
  displayText: "Set coordination enabled to {0}",
  description: "Enables or disables squad coordination processing globally.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "enabled", name: "Enabled", desc: "True enables coordination updates.", type: "boolean", initialValue: "true" },
  ],
};

export const expose = true;

export default function (enabled) {
  this._setCoordinationEnabled(enabled);
}
