/**
 * Browse EtherNet/IP and OPC UA devices and generate typed definitions.
 *
 * Run with:
 *   deno task codegen          # all protocols
 *   deno task codegen eip      # EtherNet/IP only
 *   deno task codegen opcua    # OPC UA only
 */

import { generateEipTypes, generateOpcuaTypes } from "@tentacle/plc/codegen";

const nats = {
  servers: Deno.env.get("NATS_SERVERS") || "nats://localhost:4222",
};
const filter = Deno.args[0]?.toLowerCase();
const runAll = !filter;

if (runAll || filter === "eip") {
  try {
    await generateEipTypes({
      nats,
      devices: [
        { id: "rtu45", host: "client4" },
      ],
      outputDir: "./ethernetip/generated",
    });
  } catch (err) {
    console.error(
      `EtherNet/IP codegen failed: ${err instanceof Error ? err.message : err}`,
    );
  }
}

if (runAll || filter === "opcua") {
  try {
    await generateOpcuaTypes({
      nats,
      devices: [
        {
          id: "ignition-offline",
          endpointUrl: "opc.tcp://ignition-offline:62541",
          // Note: Deno's crypto.publicEncrypt doesn't support node-opcua's key format,
          // so Basic256Sha256 transport and encrypted user tokens don't work yet.
          // Using None + anonymous for codegen (browse-only, no write access needed).
          securityPolicy: "Basic256Sha256",
          // Browse from Objects folder (root of useful nodes)
          startNodeId: "i=85",
        },
      ],
      outputDir: "./ethernetip/generated",
    });
  } catch (err) {
    console.error(
      `OPC UA codegen failed: ${err instanceof Error ? err.message : err}`,
    );
  }
}
