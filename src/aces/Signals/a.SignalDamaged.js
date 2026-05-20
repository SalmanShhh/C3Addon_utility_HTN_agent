export const config = {
  listName: "Signals: Signal Damaged",
  displayText: "Signal damaged by {0} from ({1}, {2})",
  description: "Reports damage and updates related world-state values. Use case: trigger retreat behavior when health drops.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    {
      id: "damage",
      name: "Damage",
      desc: "Damage amount.",
      type: "number",
      initialValue: "10",
    },
    {
      id: "fromX",
      name: "From X",
      desc: "Damage source x position.",
      type: "number",
      initialValue: "0",
    },
    {
      id: "fromY",
      name: "From Y",
      desc: "Damage source y position.",
      type: "number",
      initialValue: "0",
    },
  ],
};

export const expose = true;

export default function (damage, fromX, fromY) {
  this._signalDamaged(damage, fromX, fromY);
}
