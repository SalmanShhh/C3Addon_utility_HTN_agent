export const config = {
  returnType: "number",
  description: "Returns latest stimulus Y position. Use case: move to inspect where damage came from.",
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.StimulusY();
}
