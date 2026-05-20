export const config = {
  returnType: "string",
  description: "Returns this agent type id. Use case: show current AI profile in a debug panel.",
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.AgentType();
}
