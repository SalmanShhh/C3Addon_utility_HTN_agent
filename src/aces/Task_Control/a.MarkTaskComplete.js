export const config = {
  listName: "Task: Mark Task Complete",
  displayText: "Mark task complete",
  description: "Marks current task as done so plan can continue. Use case: call after reaching a patrol waypoint.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = true;

export default function () {
  this._markTaskComplete();
}
