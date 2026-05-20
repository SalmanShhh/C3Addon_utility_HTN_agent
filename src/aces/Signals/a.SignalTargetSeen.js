export const config = {
  listName: "Signals: Signal Target Seen",
  displayText: "Signal target seen UID {0} at ({1}, {2}) with confidence {3}",
  description: "Reports visual contact and updates target data. Use case: call when enemy raycast detects player.",
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
    {
      id: "confidence",
      name: "Confidence",
      desc: "Stimulus intensity from 0 to 1.",
      type: "number",
      initialValue: "1",
    },
  ],
};

export const expose = true;

export default function (targetUID, x, y, confidence) {
  this._signalTargetSeen(targetUID, x, y, confidence);
}
