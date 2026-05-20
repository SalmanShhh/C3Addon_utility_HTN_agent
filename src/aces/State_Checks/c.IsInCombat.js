export const config = {
  listName: "Is In Combat",
  displayText: "Is in combat",
  description: "True only at combat tier. Use case: start firing logic only when fully engaged.",
  isTrigger: false,
  isInvertible: true,
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.IsInCombat();
}
