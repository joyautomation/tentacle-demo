/**
 * Tentacle SNMP Demo
 *
 * Monitors an FS S3900-24T4S-R managed switch via SNMP.
 * After running codegen, import generated device constants and use
 * snmpAll/snmpVars/snmpVar to wire variables with full type safety.
 */

import {
  createPlc,
  createPlcLogger,
  snmpAll,
  type PlcVariablesRuntime,
} from "@tentacle/plc";

import { fs_s3900 } from "./generated/snmp.ts";

const log = createPlcLogger("snmp-demo");

// =============================================================================
// Variables — all standard MIB-2 OIDs from the switch
// =============================================================================

const variables = {
  ...snmpAll(fs_s3900, {
    match: /^sys|^ifDescr|^ifOperStatus|^ifSpeed|^ifInOctets|^ifOutOctets/,
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
    description: "Log switch status periodically",
    scanRate: 10000,
    program: (vars: VariablesRuntime) => {
      const sysName = vars.sysName_0?.value ?? "unknown";
      const sysUpTime = vars.sysUpTimeInstance?.value ?? 0;
      const uptimeHours = typeof sysUpTime === "number"
        ? (sysUpTime / 360000).toFixed(1)
        : "?";
      log.info(`${sysName} — uptime: ${uptimeHours}h`);
    },
  },
};

// =============================================================================
// Run
// =============================================================================

const plc = await createPlc({
  projectId: "tentacle-snmp-demo",
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

log.info("SNMP Demo running. Press Ctrl+C to stop.");
