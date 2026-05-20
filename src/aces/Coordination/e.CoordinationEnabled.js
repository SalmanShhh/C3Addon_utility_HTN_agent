export const config = {
  returnType: "number",
  description: "Returns 1 if coordination processing is enabled, else 0.",
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.CoordinationEnabled();
}
