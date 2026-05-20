export const config = {
  listName: "Setup: Set Planning Interval",
  displayText: "Set planning interval to {0} seconds",
  description: "Sets periodic planning time in seconds. Use case: increase to 2 seconds for background NPCs to reduce CPU.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    {
      id: "seconds",
      name: "Seconds",
      desc: "Interval in seconds.",
      type: "number",
      initialValue: "1",
    },
  ],
};

export const expose = true;

export default function (seconds) {
  this._setPlanningInterval(seconds);
}
