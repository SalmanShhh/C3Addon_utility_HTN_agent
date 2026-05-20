export const config = {
  returnType: "number",
  description: "Returns latest stimulus intensity. Use case: scale reaction strength from weak to strong.",
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.StimulusIntensity();
}
