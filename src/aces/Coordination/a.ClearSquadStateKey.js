export const config = {
  listName: "Coordination: Clear Squad State Key",
  displayText: "Clear squad {0} state key {1}",
  description: "Clears one shared squad state key.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "squadId", name: "Squad ID", desc: "Squad id.", type: "string", initialValue: '"alpha"' },
    { id: "key", name: "Key", desc: "State key name.", type: "string", initialValue: '"tactic"' },
  ],
};

export const expose = true;

export default function (squadId, key) {
  this._clearSquadStateKey(squadId, key);
}
