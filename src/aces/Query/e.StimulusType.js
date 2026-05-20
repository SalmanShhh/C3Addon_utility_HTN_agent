export const config = {
  returnType: "string",
  description: "Returns latest stimulus type text. Use case: handle sound and damage with different responses.",
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.StimulusType();
}
