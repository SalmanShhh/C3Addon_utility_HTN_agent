export const config = {
  listName: "Coordination: Set Squad State Key",
  displayText: "Set squad {0} state key {1} to {2}",
  description: "Writes one shared squad state key and mirrors it to squad members.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "squadId", name: "Squad ID", desc: "Squad id.", type: "string", initialValue: '"alpha"' },
    { id: "key", name: "Key", desc: "State key name.", type: "string", initialValue: '"tactic"' },
    { id: "value", name: "Value", desc: "State value.", type: "any", initialValue: '"flank"' },
  ],
};

export const expose = true;

export default function (squadId, key, value) {
  this._setSquadStateKey(squadId, key, value);
}
