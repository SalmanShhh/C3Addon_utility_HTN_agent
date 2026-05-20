export const config = {
  returnType: "string",
  description: "Returns current task id. Use case: route event-sheet logic by active task name.",
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.CurrentTask();
}
