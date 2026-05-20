export const config = {
  listName: "Is In Temporary Task",
  displayText: "Is in temporary task",
  description: "True while temporary task override is active. Use case: block normal task completion events during cutscenes.",
  isTrigger: false,
  isInvertible: true,
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.IsInTemporaryTask();
}
