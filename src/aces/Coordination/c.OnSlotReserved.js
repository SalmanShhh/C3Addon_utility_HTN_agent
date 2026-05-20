export const config = {
  listName: "On Slot Reserved",
  displayText: "On slot reserved",
  description: "Triggered when a slot reservation succeeds.",
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
