export const config = {
  listName: "Setup: Set Processing Interval",
  displayText: "Set processing interval to {0} seconds",
  description: "Sets how often periodic planning runs in seconds. Use case: raise to 2 seconds for low-priority NPCs.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    {
      id: "seconds",
      name: "Seconds",
      desc: "Interval in seconds between periodic planning updates.",
      type: "number",
      initialValue: "1",
    },
  ],
};

export const expose = true;

export default function (seconds) {
  this._setProcessingInterval(seconds);
}
