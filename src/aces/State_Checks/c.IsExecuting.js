export const config = {
  listName: "Is Executing",
  displayText: "Is executing task {0}",
  description: "True when current task matches the id. Use case: run patrol code only during task \"patrol\".",
  isTrigger: false,
  isInvertible: true,
  highlight: false,
  isDeprecated: false,
  params: [
    {
      id: "taskId",
      name: "Task ID",
      desc: "Primitive task id.",
      type: "string",
      initialValue: '""',
    },
  ],
};

export const expose = false;

export default function (taskId) {
  return this.IsExecuting(taskId);
}
