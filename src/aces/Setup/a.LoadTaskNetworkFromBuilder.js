export const config = {
  listName: "Setup: Load Task Network from Builder",
  displayText: "Load task network {0} from builder (exports as JSON string)",
  description: "Commits all accumulated tasks to a JSON representation and stores in world state for export or manager registration.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "networkId", name: "Network ID", desc: "Must match Initialize and Add calls.", type: "string", initialValue: '"custom_network"' },
    { id: "exportKey", name: "Export Key", desc: "World state key to store exported JSON (e.g., 'builtNetwork').", type: "string", initialValue: '"builtNetwork"' },
  ],
};

export const expose = true;

export default function (networkId, exportKey) {
  this._loadTaskNetworkFromBuilder(String(networkId ?? ""), String(exportKey ?? ""));
}
