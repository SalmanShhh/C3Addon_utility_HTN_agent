export const config = {
  returnType: "string",
  description: "Returns last completed task id. Use case: log finished tasks for tuning AI flow.",
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.CompletedTask();
}
