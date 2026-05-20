export const config = {
  listName: "On Task Failed",
  displayText: "On task failed",
  description: "Runs after task failure is marked. Use case: play a failed path reaction before retry.",
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
