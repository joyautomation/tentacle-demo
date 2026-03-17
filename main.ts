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
  type PlcVariablesRuntime,
} from "@tentacle/plc";

import { rtu45, udtTemplates } from "./generated/ethernetip.ts";

const log = createPlcLogger("demo");

// =============================================================================
// Variables — VLV, MTR, Analog Inputs, and TOD
// =============================================================================

const variables = {
  ...eipAll(rtu45, udtTemplates, {
    structTypes: [
      "Get_TOD",
    ],
  }),
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
    program: (_vars: VariablesRuntime) => {
      log.info("Poll cycle");
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
