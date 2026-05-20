import {
  ADDON_CATEGORY,
  ADDON_TYPE,
  PLUGIN_TYPE,
  PROPERTY_TYPE,
} from "./template/enums.js";
import _version from "./version.js";
export const addonType = ADDON_TYPE.BEHAVIOR;
export const type = PLUGIN_TYPE.OBJECT;
export const id = "salmanshh_DHTN_Agent";
export const name = "Utility-Driven HTN (Hierarchical Task Network) Agent";
export const version = _version;
export const minConstructVersion = undefined;
export const author = "SalmanShh";
export const website = "https://www.construct.net";
export const documentation = "https://www.construct.net";
export const description = "Give any object smart AI, attach this behavior and it automatically registers with the HTN Manager, runs utility-scored planning, tracks alert tiers, reacts to sight/sound/damage signals, and fires clean event-sheet triggers for each task. No AI boilerplate, no per-instance glue code. Supports squads, slot-based tactical coordination, temporary task overrides, save/load, and performance scaling for any game size.";
export const category = ADDON_CATEGORY.ATTRIBUTES;

export const hasDomside = false;
export const files = {
  extensionScript: {
    enabled: false, // set to false to disable the extension script
    watch: true, // set to true to enable live reload on changes during development
    targets: ["x86", "x64"],
    // you don't need to change this, the build step will rename the dll for you. Only change this if you change the name of the dll exported by Visual Studio
    name: "MyExtension",
  },
  fileDependencies: [],
  remoteFileDependencies: [
    // {
    //   src: "https://example.com/api.js", // Must use https:// or same-protocol // URLs. http:// is not allowed.
    //   type: "" // Optional: "" or "module". Empty string or omit for classic script.
    // }
  ],
  cordovaPluginReferences: [],
  cordovaResourceFiles: [],
};

// categories that are not filled will use the folder name
export const aceCategories = {
  Setup: "Setup",
  World_State: "World State",
  Signals: "Signals",
  Task_Control: "Task Control",
  Coordination: "Coordination",
  Events: "Events",
  State_Checks: "State Checks",
  Query: "Query",
};

export const info = {
  // icon: "icon.svg",
  // PLUGIN world only
  // defaultImageUrl: "default-image.png",
  Set: {
    // COMMON to all
    CanBeBundled: true,
    IsDeprecated: false,
    GooglePlayServicesEnabled: false,

    // BEHAVIOR only
    IsOnlyOneAllowed: false,

    // PLUGIN world only
    IsResizable: false,
    IsRotatable: false,
    Is3D: false,
    HasImage: false,
    IsTiled: false,
    SupportsZElevation: false,
    SupportsColor: false,
    SupportsEffects: false,
    MustPreDraw: false,

    // PLUGIN object only
    IsSingleGlobal: true,
  },
  // PLUGIN only
  AddCommonACEs: {
    Position: false,
    SceneGraph: false,
    Size: false,
    Angle: false,
    Appearance: false,
    ZOrder: false,
  },
};

export const properties = [
  {
    type: PROPERTY_TYPE.TEXT,
    id: "agentType",
    options: {
      initialValue: "default",
    },
    name: "Agent Type",
    desc: "Selects which AI network this object uses. Use case: assign \"grunt\" to basic enemies and \"boss\" to bosses.",
  },
  {
    type: PROPERTY_TYPE.COMBO,
    id: "planningMode",
    options: {
      initialValue: "hybrid",
      items: [
        { reactive: "Reactive" },
        { deliberate: "Deliberate" },
        { hybrid: "Hybrid" },
      ],
    },
    name: "Planning Mode",
    desc: "Sets when planning runs. Use case: choose deliberate for many background NPCs to reduce CPU usage.",
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "planningIntervalSec",
    options: {
      initialValue: 1,
      minValue: 0,
    },
    name: "Planning Interval (sec)",
    desc: "Time in seconds between periodic replans. Use case: set 0.5 for responsive guards, 2.0 for idle crowds.",
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "urgencyThreshold",
    options: {
      initialValue: 0.55,
      minValue: 0,
      maxValue: 1,
    },
    name: "Urgency Threshold",
    desc: "Urgency needed to replan instantly in hybrid mode. Use case: keep low for stealth games that need quick reactions.",
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "initialAlertLevel",
    options: {
      initialValue: 0,
      minValue: 0,
      maxValue: 1,
    },
    name: "Initial Alert Level",
    desc: "Starting alert value from 0 to 1. Use case: begin ambush enemies at 0.6 so they start suspicious.",
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "taskTimeoutSec",
    options: {
      initialValue: 0,
      minValue: 0,
    },
    name: "Task Timeout (sec)",
    desc: "Auto-fails a stuck task after this many seconds. Use case: set 8 to recover if pathing gets blocked.",
  },
  {
    type: PROPERTY_TYPE.CHECK,
    id: "autoRegister",
    options: {
      initialValue: true,
    },
    name: "Auto Register",
    desc: "Registers with the manager on spawn. Use case: disable for cutscene actors you register later by events.",
  },
  {
    type: PROPERTY_TYPE.CHECK,
    id: "enabled",
    options: {
      initialValue: true,
    },
    name: "Enabled",
    desc: "Turns this behavior processing on or off. Use case: disable far-away enemies to save performance.",
  },
  {
    type: PROPERTY_TYPE.TEXT,
    id: "debugLabel",
    options: {
      initialValue: "",
    },
    name: "Debug Label",
    desc: "Optional name shown in warnings. Use case: set \"Guard_North\" to quickly identify problem agents.",
  },
];
