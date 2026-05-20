export const config = {
  returnType: "number",
  description: "Returns squad member UID at a zero-based index.",
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "squadId", name: "Squad ID", desc: "Squad id.", type: "string" },
    { id: "index", name: "Index", desc: "Zero-based member index.", type: "number" },
  ],
};

export const expose = false;

export default function (squadId, index) {
  return this.GetSquadAgentUIDByIndex(squadId, index);
}
