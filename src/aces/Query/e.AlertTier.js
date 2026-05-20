export const config = {
  returnType: "number",
  description: "Returns alert tier index. Use case: switch behavior branches with a numeric tier check.",
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.AlertTier();
}
