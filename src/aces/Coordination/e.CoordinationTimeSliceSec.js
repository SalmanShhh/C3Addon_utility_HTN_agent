export const config = {
  returnType: "number",
  description: "Returns coordination time slice cap in seconds.",
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.CoordinationTimeSliceSec();
}
