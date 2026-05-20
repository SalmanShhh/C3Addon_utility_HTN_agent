export const config = {
  listName: "Is Enabled",
  displayText: "Is enabled",
  description: "True when this behavior is processing. Use case: skip AI movement events when disabled.",
  isTrigger: false,
  isInvertible: true,
  highlight: false,
  isDeprecated: false,
  params: [],
};

export const expose = false;

export default function () {
  return this.IsEnabled();
}
