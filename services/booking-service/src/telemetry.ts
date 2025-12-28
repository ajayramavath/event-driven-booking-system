import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const SERVICE_NAME = "booking-service";

const traceExporter = new OTLPTraceExporter({
  url: "http://jaeger:4318/v1/traces",
});

const sdk = new NodeSDK({
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: SERVICE_NAME
});

sdk.start();

process.on("SIGTERM", async () => {
  await sdk.shutdown();
});
