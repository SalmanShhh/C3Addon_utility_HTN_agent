export const config = {
  listName: "World State: Set World State",
  displayText: "Set world state key {0} to {1}",
  description: "Writes any custom world-state key for this agent. Use case: set \"hasCover\" after finding cover.",
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
    {
      id: "value",
      name: "Value",
      desc: "World state value.",
      type: "any",
      initialValue: "0",
    },
  ],
};

export const expose = true;

export default function (key, value) {
  this._setWorldState(key, value);
}
