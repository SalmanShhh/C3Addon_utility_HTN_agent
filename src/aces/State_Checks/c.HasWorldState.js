export const config = {
  listName: "Has World State",
  displayText: "Has world state key {0}",
  description: "True if a world-state key exists. Use case: check if patrol data was set before using it.",
  isTrigger: false,
  isInvertible: true,
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

export const expose = false;

export default function (key) {
  return this.HasWorldState(key);
}
