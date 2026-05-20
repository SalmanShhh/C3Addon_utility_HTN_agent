export const config = {
  listName: "Coordination: Invalidate Squad Plans",
  displayText: "Invalidate plans for squad {0}",
  description: "Marks squad plans stale so they are replanned on coordination pass.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "squadId", name: "Squad ID", desc: "Squad id.", type: "string", initialValue: '"alpha"' },
  ],
};

export const expose = true;

export default function (squadId) {
  this._invalidateSquadPlans(squadId);
}
