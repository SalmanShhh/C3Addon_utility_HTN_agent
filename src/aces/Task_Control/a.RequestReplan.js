export const config = {
  listName: "Task: Request Replan",
  displayText: "Request replan",
  description: "Requests an immediate replan now. Use case: call right after a major world-state change.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = true;

export default function () {
  this._requestPlan();
}
