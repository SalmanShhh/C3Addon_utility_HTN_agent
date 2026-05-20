export const config = {
  returnType: "number",
  description: "Returns member count for a squad.",
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "squadId", name: "Squad ID", desc: "Squad id.", type: "string" },
  ],
};

export const expose = false;

export default function (squadId) {
  return this.CountSquadAgents(squadId);
}
