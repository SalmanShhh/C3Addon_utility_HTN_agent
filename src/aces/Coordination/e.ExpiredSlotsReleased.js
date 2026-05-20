export const config = {
  returnType: "number",
  description: "Returns total number of expired slot releases.",
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.ExpiredSlotsReleased();
}
