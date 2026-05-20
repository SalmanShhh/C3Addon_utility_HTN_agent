export const config = {
  listName: "On Temporary Task Started",
  displayText: "On temporary task started",
  description: "Runs when temporary override starts. Use case: force a guard to hold position briefly.",
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
