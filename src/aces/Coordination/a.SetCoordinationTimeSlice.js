export const config = {
  listName: "Coordination: Set Coordination Time Slice",
  displayText: "Set coordination time slice to {0} sec",
  description: "Sets optional time slice cap per coordination pass. 0 disables slice.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "seconds", name: "Seconds", desc: "Time slice in seconds.", type: "number", initialValue: "0" },
  ],
};

export const expose = true;

export default function (seconds) {
  this._setCoordinationTimeSlice(seconds);
}
