export const config = {
  listName: "Is Paused",
  displayText: "Is paused",
  description: "True when Pause was applied. Use case: avoid sending duplicate pause commands.",
  isTrigger: false,
  isInvertible: true,
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.IsPaused();
}
