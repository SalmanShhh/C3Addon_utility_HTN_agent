export const config = {
  listName: "Coordination: Set Coordination Update Interval",
  displayText: "Set coordination update interval to {0} sec",
  description: "Sets global coordination update interval in seconds.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "seconds", name: "Seconds", desc: "Update interval in seconds.", type: "number", initialValue: "0.1" },
  ],
};

export const expose = true;

export default function (seconds) {
  this._setCoordinationUpdateInterval(seconds);
}
