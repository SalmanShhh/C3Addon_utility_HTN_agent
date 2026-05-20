export const config = {
  listName: "World State: Set Target",
  displayText: "Set target UID {0} at ({1}, {2})",
  description: "Sets target UID and position in one step. Use case: lock onto player when entering attack range.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    {
      id: "targetUID",
      name: "Target UID",
      desc: "Target instance UID.",
      type: "number",
      initialValue: "0",
    },
    {
      id: "x",
      name: "X",
      desc: "Target x position.",
      type: "number",
      initialValue: "0",
    },
    {
      id: "y",
      name: "Y",
      desc: "Target y position.",
      type: "number",
      initialValue: "0",
    },
  ],
};

export const expose = true;

export default function (targetUID, x, y) {
  this._setTarget(targetUID, x, y);
}
