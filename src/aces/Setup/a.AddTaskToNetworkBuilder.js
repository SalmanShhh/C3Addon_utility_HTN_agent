export const config = {
  listName: "Setup: Add Task to Network Builder",
  displayText: "Add task {0} to network builder for {1}",
  description: "Adds one task to the network being built. Specify task ID and description for manager reference.",
  isAsync: false,
  highlight: false,
  isDeprecated: false,
  params: [
    { id: "taskId", name: "Task ID", desc: "Unique identifier for this primitive task (e.g., 'patrol', 'chase', 'idle').", type: "string", initialValue: '"task_1"' },
    { id: "networkId", name: "Network ID", desc: "Must match the Initialize call.", type: "string", initialValue: '"custom_network"' },
    { id: "description", name: "Description", desc: "Human-readable task description for debugging.", type: "string", initialValue: '"Perform task"' },
    { id: "taskType", name: "Task Type", desc: "primitive, composite, or method.", type: "combo", initialValue: '"primitive"', items: [{ primitive: "Primitive" }, { composite: "Composite" }, { method: "Method" }] },
  ],
};

export const expose = true;

export default function (taskId, networkId, description, taskType) {
  this._addTaskToNetworkBuilder(
    String(taskId ?? ""),
    String(networkId ?? ""),
    String(description ?? ""),
    String(taskType ?? "primitive")
  );
}
