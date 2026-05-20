export const config = {
  returnType: "any",
  description: "Returns one squad state value by key.",
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "squadId", name: "Squad ID", desc: "Squad id.", type: "string" },
    { id: "key", name: "Key", desc: "State key name.", type: "string" },
  ],
};

export const expose = false;

export default function (squadId, key) {
  return this.SquadStateValue(squadId, key);
}
