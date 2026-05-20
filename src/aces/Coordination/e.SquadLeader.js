export const config = {
  returnType: "number",
  description: "Returns leader UID for a squad.",
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "squadId", name: "Squad ID", desc: "Squad id.", type: "string" },
  ],
};

export const expose = false;

export default function (squadId) {
  return this.SquadLeader(squadId);
}
