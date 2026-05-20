export const config = {
  listName: "On Plan Failed",
  displayText: "On plan failed",
  description: "Runs when no valid plan is found. Use case: force a safe fallback task like idle.",
  isTrigger: true,
  isInvertible: false,
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return true;
}
