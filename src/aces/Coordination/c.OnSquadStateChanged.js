export const config = {
  listName: "On Squad State Changed",
  displayText: "On squad state changed",
  description: "Triggered when a squad shared state key is updated or cleared.",
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
