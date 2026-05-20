export const config = {
  listName: "On Task Completed",
  displayText: "On task completed",
  description: "Runs after task completion is marked. Use case: start movement for the next task.",
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
