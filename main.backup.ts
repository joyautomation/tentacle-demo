/**
 * Tentacle Demo PLC
 *
 * After running codegen, import generated device constants and use
 * eipAll/eipVars/eipVar to wire variables with full type safety.
 */

import {
  createPlc,
  createPlcLogger,
  eipAll,
  type PlcVariableBooleanConfig,
  type PlcVariablesRuntime,
} from "@tentacle/plc";

import { rtu45, udtTemplates } from "./generated/ethernetip.ts";

const log = createPlcLogger("demo");

// =============================================================================
// Variables
// =============================================================================

const variables = {
  // All RTU45_RECLM tags (atomic + UDT) in one line:
  ...eipAll(rtu45, udtTemplates, { match: /^RTU45_RECLM/ }),

  isRunning: {
    id: "isRunning",
    description: "System running state",
    datatype: "boolean",
    default: false,
    source: { bidirectional: true },
  } satisfies PlcVariableBooleanConfig,
};

type Variables = typeof variables;
type VariablesRuntime = PlcVariablesRuntime<Variables>;

// =============================================================================
// Tasks
// =============================================================================

const tasks = {
  logger: {
    name: "Logger",
    description: "Log variable values periodically",
    scanRate: 5000,
    program: (vars: VariablesRuntime) => {
      log.info(
        `Running: ${vars.isRunning.value}`,
      );
    },
  },
};

// =============================================================================
// Run
// =============================================================================

const plc = await createPlc({
  projectId: "tentacle-demo",
  variables,
  tasks,
  nats: {
    servers: Deno.env.get("NATS_SERVERS") || "nats://localhost:4222",
  },
});

Deno.addSignalListener("SIGINT", async () => {
  log.info("Shutting down...");
  await plc.stop();
  Deno.exit(0);
});

log.info("Demo PLC running. Press Ctrl+C to stop.");
