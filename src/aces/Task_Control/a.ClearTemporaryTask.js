export const config = {
  listName: "Task: Clear Temporary Task",
  displayText: "Clear temporary task",
  description: "Stops temporary override and returns to normal planning. Use case: end cutscene idle behavior early.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = true;

export default function () {
  this._endTemporaryTask();
}
