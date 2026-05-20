export const config = {
  listName: "Signals: Signal Sound Heard",
  displayText: "Signal sound at ({0}, {1}) with intensity {2}",
  description: "Reports a sound event for hearing reactions. Use case: alert nearby guards when player makes noise.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    {
      id: "x",
      name: "X",
      desc: "Sound x position.",
      type: "number",
      initialValue: "0",
    },
    {
      id: "y",
      name: "Y",
      desc: "Sound y position.",
      type: "number",
      initialValue: "0",
    },
    {
      id: "intensity",
      name: "Intensity",
      desc: "Stimulus intensity from 0 to 1.",
      type: "number",
      initialValue: "1",
    },
  ],
};

export const expose = true;

export default function (x, y, intensity) {
  this._signalSoundHeard(x, y, intensity);
}
