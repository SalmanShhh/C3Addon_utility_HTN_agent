export const config = {
  listName: "Coordination: Load Slot Positions From JSON",
  displayText: "Load slot positions for type {1} in squad {0} from JSON {2}",
  description: "Imports slot coordinates from a JSON array string.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "squadId", name: "Squad ID", desc: "Squad id.", type: "string", initialValue: '"alpha"' },
    { id: "slotType", name: "Slot Type", desc: "Slot type name.", type: "string", initialValue: '"coverSlot"' },
    { id: "slotsJson", name: "Slots JSON", desc: "JSON array with slot ids and positions.", type: "string", initialValue: '"[]"' },
  ],
};

export const expose = true;

export default function (squadId, slotType, slotsJson) {
  this._loadSlotPositionsFromJSON(squadId, slotType, slotsJson);
}
