export const config = {
  returnType: "string",
  description: "Returns task restored after temporary override. Use case: continue a paused patrol task cleanly.",
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.RestoredTask();
}
