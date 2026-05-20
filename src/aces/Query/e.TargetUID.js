export const config = {
  returnType: "number",
  description: "Returns current target UID. Use case: fetch target instance for aim or movement logic.",
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.TargetUID();
}
