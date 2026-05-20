export const config = {
  returnType: "number",
  description: "Returns number of coordination squads processed in last pass.",
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.CoordinationPassesThisTick();
}
