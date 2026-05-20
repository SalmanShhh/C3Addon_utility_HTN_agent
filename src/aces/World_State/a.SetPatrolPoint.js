export const config = {
  listName: "World State: Set Patrol Point",
  displayText: "Set patrol point {0} to ({1}, {2})",
  description: "Stores a patrol waypoint in world state. Use case: set patrol routes at layout start from events.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    {
      id: "index",
      name: "Index",
      desc: "Patrol point index.",
      type: "number",
      initialValue: "0",
    },
    {
      id: "x",
      name: "X",
      desc: "Point x position.",
      type: "number",
      initialValue: "0",
    },
    {
      id: "y",
      name: "Y",
      desc: "Point y position.",
      type: "number",
      initialValue: "0",
    },
  ],
};

export const expose = true;

export default function (index, x, y) {
  this._setPatrolPoint(index, x, y);
}
