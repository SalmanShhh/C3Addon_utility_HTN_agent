export const config = {
  returnType: "number",
  description: "Returns coordination update interval in seconds.",
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.CoordinationIntervalSec();
}
