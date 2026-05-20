export const config = {
  returnType: "number",
  description: "Returns alert level from 0 to 1. Use case: drive UI color intensity for enemy awareness.",
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.AlertLevel();
}
