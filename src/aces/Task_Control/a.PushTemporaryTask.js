export const config = {
  listName: "Task: Push Temporary Task",
  displayText: "Push temporary task {0} for {1} seconds",
  description: "Runs a one-off task before returning to normal plan. Use case: force \"idle\" during a short cutscene.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    {
      id: "taskId",
      name: "Task ID",
      desc: "Temporary primitive task id.",
      type: "string",
      initialValue: '"idle"',
    },
    {
      id: "durationSec",
      name: "Duration (sec)",
      desc: "Override duration in seconds. Use 0 for manual completion.",
      type: "number",
      initialValue: "0",
    },
  ],
};

export const expose = true;

export default function (taskId, durationSec) {
  this._pushTemporaryTask(taskId, durationSec);
}
