export const config = {
  listName: "Setup: Initialize Task Network Builder",
  displayText: "Initialize task network builder for network {0}",
  description: "Starts a new task network definition. Use with Add Task to Builder then commit with Load Task Network.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "networkId", name: "Network ID", desc: "Unique identifier for this task network (e.g., 'guard', 'patrol', 'boss').", type: "string", initialValue: '"custom_network"' },
  ],
};

export const expose = true;

export default function (networkId) {
  this._initializeTaskNetworkBuilder(String(networkId ?? ""));
}
