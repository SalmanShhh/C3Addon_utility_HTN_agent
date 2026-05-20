export const config = {
  returnType: "number",
  description: "Returns remaining task count. Use case: detect empty plans and request fallback behavior.",
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.PlanLength();
}
