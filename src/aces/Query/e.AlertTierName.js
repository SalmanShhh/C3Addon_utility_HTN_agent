export const config = {
  returnType: "string",
  description: "Returns alert tier name text. Use case: print \"suspicious\" or \"combat\" to debug text.",
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.AlertTierName();
}
