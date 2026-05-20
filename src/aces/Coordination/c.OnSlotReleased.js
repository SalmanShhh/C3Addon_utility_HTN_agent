export const config = {
  listName: "On Slot Released",
  displayText: "On slot released",
  description: "Triggered when a slot reservation is released or expires.",
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
