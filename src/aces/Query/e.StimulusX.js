export const config = {
  returnType: "number",
  description: "Returns latest stimulus X position. Use case: face toward the source of a sound.",
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.StimulusX();
}
