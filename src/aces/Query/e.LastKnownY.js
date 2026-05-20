export const config = {
  returnType: "number",
  description: "Returns last known target Y. Use case: move to investigate where the player was seen.",
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.LastKnownY();
}
