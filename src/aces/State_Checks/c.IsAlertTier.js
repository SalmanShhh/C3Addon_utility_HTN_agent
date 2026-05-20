export const config = {
  listName: "Is Alert Tier",
  displayText: "Is alert tier {0}",
  description: "True when alert tier matches selected value. Use case: run separate logic for suspicious vs combat.",
  isTrigger: false,
  isInvertible: true,
  highlight: false,
  isDeprecated: false,
  params: [
    {
      id: "tier",
      name: "Tier",
      desc: "Alert tier to test.",
      type: "combo",
      initialValue: "0",
      items: [
        { 0: "Unaware" },
        { 1: "Suspicious" },
        { 2: "Alerted" },
        { 3: "Combat" },
      ],
    },
  ],
};

export const expose = false;

export default function (tier) {
  return this.IsAlertTier(tier);
}
