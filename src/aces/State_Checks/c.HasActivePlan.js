export const config = {
  listName: "Has Active Plan",
  displayText: "Has active plan",
  description: "True when this agent still has work to do. Use case: skip idle logic while a plan is active.",
  isTrigger: false,
  isInvertible: true,
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.HasActivePlan();
}
