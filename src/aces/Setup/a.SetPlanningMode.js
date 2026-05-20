export const config = {
  listName: "Setup: Set Planning Mode",
  displayText: "Set planning mode to {0}",
  description: "Changes when this agent replans. Use case: use reactive mode for bosses that must react instantly.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    {
      id: "mode",
      name: "Mode",
      desc: "Reactive, deliberate, or hybrid.",
      type: "combo",
      initialValue: "hybrid",
      items: [
        { reactive: "Reactive" },
        { deliberate: "Deliberate" },
        { hybrid: "Hybrid" },
      ],
    },
  ],
};

export const expose = true;

export default function (mode) {
  this._setPlanningMode(mode);
}
