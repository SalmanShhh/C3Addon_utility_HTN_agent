export const config = {
  listName: "Coordination: Request Squad Plans",
  displayText: "Request plans for squad {0}",
  description: "Requests immediate plan updates for all squad members.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "squadId", name: "Squad ID", desc: "Squad id.", type: "string", initialValue: '"alpha"' },
  ],
};

export const expose = true;

export default function (squadId) {
  this._requestSquadPlans(squadId);
}
