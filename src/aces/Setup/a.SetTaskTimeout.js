export const config = {
  listName: "Setup: Set Task Timeout",
  displayText: "Set task timeout to {0} seconds",
  description: "Sets auto-fail timeout in seconds for stuck tasks. Use case: recover agents stuck behind obstacles.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    {
      id: "seconds",
      name: "Seconds",
      desc: "Timeout in seconds. Use 0 to disable.",
      type: "number",
      initialValue: "0",
    },
  ],
};

export const expose = true;

export default function (seconds) {
  this._setTaskTimeout(seconds);
}
