export const config = {
  listName: "Signals: Signal Target Lost",
  displayText: "Signal target lost",
  description: "Marks target as no longer visible. Use case: call when line-of-sight breaks.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = true;

export default function () {
  this._signalTargetLost();
}
