export const config = {
  returnType: "string",
  description: "Returns last failed task id. Use case: track tasks that frequently fail and need redesign.",
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.FailedTask();
}
