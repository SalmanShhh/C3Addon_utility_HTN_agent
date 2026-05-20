export const config = {
  listName: "Coordination: Squad Plan Control",
  displayText: "Squad plan control mode {0} for squad {1}",
  description: "Combined squad plan control for invalidate, request, or both.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    {
      id: "mode",
      name: "Mode",
      desc: "Plan control mode.",
      type: "combo",
      initialValue: "request",
      items: [{ invalidate: "Invalidate" }, { request: "Request" }, { both: "Both" }],
    },
    { id: "squadId", name: "Squad ID", desc: "Squad id.", type: "string", initialValue: '"alpha"' },
  ],
};

export const expose = true;

export default function (mode, squadId) {
  this._squadPlanControl(mode, squadId);
}
