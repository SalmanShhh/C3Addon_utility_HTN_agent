export const config = {
  listName: "World State: Clear Target",
  displayText: "Clear target",
  description: "Removes current target data for this agent. Use case: clear chase data after the player escapes.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = true;

export default function () {
  this._clearTarget();
}
