export const config = {
  returnType: "number",
  description: "Returns previous alert tier index. Use case: trigger one-time effects on tier changes.",
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.PreviousTier();
}
