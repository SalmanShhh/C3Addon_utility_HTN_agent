export const config = {
  listName: "Coordination: Set Slot Default TTL",
  displayText: "Set slot default ttl to {0} sec",
  description: "Sets default reservation TTL in seconds for slot operations.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "seconds", name: "Seconds", desc: "Default slot ttl in seconds.", type: "number", initialValue: "1" },
  ],
};

export const expose = true;

export default function (seconds) {
  this._setCoordinationSlotDefaultTtl(seconds);
}
