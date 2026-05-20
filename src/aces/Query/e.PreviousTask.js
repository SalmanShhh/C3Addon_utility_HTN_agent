export const config = {
  returnType: "string",
  description: "Returns previous task id. Use case: detect transitions like patrol to chase.",
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.PreviousTask();
}
