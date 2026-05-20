export const config = {
  listName: "Has Target",
  displayText: "Has target",
  description: "True when a visible target is set. Use case: only run chase movement when target exists.",
  isTrigger: false,
  isInvertible: true,
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.HasTarget();
}
