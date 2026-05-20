export const config = {
  listName: "Task: Pause",
  displayText: "Pause agent",
  description: "Pauses AI updates for this object. Use case: freeze enemies during pause menu or dialogue.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = true;

export default function () {
  this._pause();
}
