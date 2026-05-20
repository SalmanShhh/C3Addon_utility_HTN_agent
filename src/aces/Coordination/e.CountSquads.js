export const config = {
  returnType: "number",
  description: "Returns number of active squads.",
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.CountSquads();
}
