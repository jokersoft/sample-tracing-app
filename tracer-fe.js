'use strict';

const opentelemetry = require('@opentelemetry/api');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes: ResourceAttributesSC } = require('@opentelemetry/semantic-conventions');
const { ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");

module.exports = (serviceName) => {
    const provider = new NodeTracerProvider({
        resource: new Resource({
            [ResourceAttributesSC.SERVICE_NAME]: serviceName,
        }),
    });

    const exporterOptions = {
        headers: {
            'Content-Type': 'application/json',
            // possible authentication here
        },
        attributes : {
            'attr': 'attr-value',
            'service.name': 'sample-tracing-app',
        },
    }

    console.log('tracer-fe...');
    const exporter = new OTLPTraceExporter(exporterOptions);
    // const exporter = new ConsoleSpanExporter();

    registerInstrumentations({
        tracerProvider: provider,
        instrumentations: [
            // Express instrumentation expects HTTP layer to be instrumented
            HttpInstrumentation,
            ExpressInstrumentation,
        ],
    });

    provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

    // Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
    provider.register();

    return opentelemetry.trace.getTracer('express-example');
};
