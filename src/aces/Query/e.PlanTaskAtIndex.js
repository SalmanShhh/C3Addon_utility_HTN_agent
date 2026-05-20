export const config = {
  returnType: "string",
  description: "Returns task id at a plan index. Use case: preview next task for debugging.",
  highlight: false,
  isDeprecated: false,
  params: [
    {
      id: "index",
      name: "Index",
      desc: "Zero-based index.",
      type: "number",
    },
  ],
};

export const expose = false;

export default function (index) {
  return this.PlanTaskAtIndex(index);
}
