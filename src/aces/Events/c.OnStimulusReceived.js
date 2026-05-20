export const config = {
  listName: "On Stimulus Received",
  displayText: "On stimulus received",
  description: "Runs when a signal is received. Use case: play an exclamation sound when enemy hears noise.",
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
