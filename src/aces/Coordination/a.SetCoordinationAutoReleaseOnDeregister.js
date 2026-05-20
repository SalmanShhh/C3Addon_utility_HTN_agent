export const config = {
  listName: "Coordination: Set Auto Release On Deregister",
  displayText: "Set auto release on deregister to {0}",
  description: "Controls whether owned slots are auto-released when agents are deregistered.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "enabled", name: "Enabled", desc: "True enables auto release on deregister.", type: "boolean", initialValue: "true" },
  ],
};

export const expose = true;

export default function (enabled) {
  this._setCoordinationAutoReleaseOnDeregister(enabled);
}
