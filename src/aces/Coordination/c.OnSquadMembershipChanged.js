export const config = {
  listName: "On Squad Membership Changed",
  displayText: "On squad membership changed",
  description: "Triggered when an agent joins or leaves a squad.",
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
