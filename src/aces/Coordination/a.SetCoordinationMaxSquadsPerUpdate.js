export const config = {
  listName: "Coordination: Set Max Squads Per Update",
  displayText: "Set max squads per coordination update to {0}",
  description: "Caps number of squads processed per coordination pass. 0 means all.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "count", name: "Count", desc: "Maximum squads per update pass.", type: "number", initialValue: "0" },
  ],
};

export const expose = true;

export default function (count) {
  this._setCoordinationMaxSquadsPerUpdate(count);
}
