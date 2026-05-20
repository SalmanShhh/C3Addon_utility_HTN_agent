export const config = {
  listName: "Is Alerted",
  displayText: "Is alerted",
  description: "True for alerted or combat tiers. Use case: enable weapon behavior only at high alert.",
  isTrigger: false,
  isInvertible: true,
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.IsAlerted();
}
