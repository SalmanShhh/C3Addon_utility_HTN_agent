export const config = {
  listName: "Task: Resume",
  displayText: "Resume agent",
  description: "Resumes AI updates and replans immediately. Use case: wake enemies when player enters the area.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = true;

export default function () {
  this._resume();
}
