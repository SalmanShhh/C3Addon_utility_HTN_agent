export const config = {
  listName: "Task: Mark Task Failed",
  displayText: "Mark task failed",
  description: "Marks current task as failed to force replanning. Use case: call when pathfinding cannot reach target.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = true;

export default function () {
  this._markTaskFailed();
}
