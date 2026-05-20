export const config = {
  listName: "On Task Started",
  displayText: "On task started",
  description: "Runs when a new primitive task starts. Use case: branch event logic by CurrentTask.",
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
