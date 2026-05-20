export const config = {
  returnType: "number",
  description: "Returns 1 if enabled, else 0. Use case: show current AI processing state in a debug text object.",
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.Enabled() ? 1 : 0;
}
