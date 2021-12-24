'use strict';

const opentelemetry = require('@opentelemetry/api');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { AwsInstrumentation } = require('@opentelemetry/instrumentation-aws-sdk');

module.exports = (serviceName) => {
    const provider = new NodeTracerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
        plugins: {
            'aws-sdk': { enabled: false, path: 'opentelemetry-plugin-aws-sdk' }
        }
    });

    const options = {
        headers: {
            'Content-Type': 'application/json',
        },
        attributes : {
            'attr': 'attr-value',
            'service.name': 'sample-tracing-app',
        },
    }

    console.log('tracer-be...');
    let exporter = new OTLPTraceExporter(options);

    provider.addSpanProcessor(new BatchSpanProcessor(exporter, {
        // The maximum queue size. After the size is reached spans are dropped.
        maxQueueSize: 100,
        // The maximum batch size of every export. It must be smaller or equal to maxQueueSize.
        maxExportBatchSize: 10,
        // The interval between two consecutive exports
        scheduledDelayMillis: 500,
        // How long the export can run before it is cancelled
        exportTimeoutMillis: 30000,
    }));

    // Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
    provider.register();

    registerInstrumentations({
        provider,
        instrumentations: [
            new HttpInstrumentation({
                requireParentforOutgoingSpans: true,
                requireParentforIncomingSpans: true,
            }),
            new AwsInstrumentation({
                // see https://www.npmjs.com/package/opentelemetry-instrumentation-aws-sdk
                preRequestHook: (span, request) => {
                    if (span.serviceName === 's3') {
                        span.setAttribute("s3.bucket.name", request.commandInput["Bucket"]);
                    }
                }
            })
        ],
    });

    return opentelemetry.trace.getTracer('sample-tracing-app-be');
};
