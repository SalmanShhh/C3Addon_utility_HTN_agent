export const config = {
  listName: "On Temporary Task Ended",
  displayText: "On temporary task ended",
  description: "Runs when temporary override ends. Use case: resume normal patrol animation.",
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
