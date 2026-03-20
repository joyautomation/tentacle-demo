/**
 * Browse SNMP devices and generate typed definitions.
 *
 * Run with:
 *   deno task codegen:snmp
 */

import { generateSnmpTypes } from "@tentacle/plc/codegen";

const nats = {
  servers: Deno.env.get("NATS_SERVERS") || "nats://localhost:4222",
};

try {
  await generateSnmpTypes({
    nats,
    devices: [
      {
        id: "fs_s3900",
        host: "192.168.82.55",
        community: "public",
        rootOid: ".1.3.6.1.2.1",
      },
    ],
    outputDir: "./snmp/generated",
  });
} catch (err) {
  console.error(
    `SNMP codegen failed: ${err instanceof Error ? err.message : err}`,
  );
}
