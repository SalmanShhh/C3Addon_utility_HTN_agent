export const config = {
  listName: "World State: Clear World State Key",
  displayText: "Clear world state key {0}",
  description: "Deletes one world-state key on this agent. Use case: clear a temporary flag like \"heardNoise\".",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    {
      id: "key",
      name: "Key",
      desc: "World state key name.",
      type: "string",
      initialValue: '"key"',
    },
  ],
};

export const expose = true;

export default function (key) {
  this._clearWorldStateKey(String(key ?? ""));
}
