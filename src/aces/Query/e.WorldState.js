export const config = {
  returnType: "any",
  description: "Reads a world-state value by key. Use case: check custom flags like \"isCoverAvailable\" in events.",
  highlight: false,
  isDeprecated: false,
  params: [
    {
      id: "key",
      name: "Key",
      desc: "World state key name.",
      type: "string",
    },
  ],
};

export const expose = false;

export default function (key) {
  return this.WorldState(key);
}
