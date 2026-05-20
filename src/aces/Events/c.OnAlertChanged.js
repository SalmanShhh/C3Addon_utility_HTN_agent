export const config = {
  listName: "On Alert Changed",
  displayText: "On alert changed",
  description: "Runs when alert tier changes. Use case: switch sprite animation from patrol to combat.",
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
