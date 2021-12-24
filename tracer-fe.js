'use strict';

const opentelemetry = require('@opentelemetry/api');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { WebTracerProvider } = require('@opentelemetry/sdk-trace-web');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');

module.exports = (serviceName) => {
    const provider = new WebTracerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
    });

    console.log('tracer-fe...');
    let exporter = new ConsoleSpanExporter();
    provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
    provider.register();

    registerInstrumentations({
        instrumentations: [
            new HttpInstrumentation({
                requireParentforOutgoingSpans: true,
                // requestHook: (span, request) => {
                //     // https://www.w3.org/TR/trace-context/
                //     if (request instanceof ClientRequest) {
                //         const version = Number(1).toString(16)
                //         const traceData = `${version}-${span.context().traceId}-${
                //             span.context().spanId
                //         }-${span.context().traceFlags}`
                //         request.setHeader('traceparent', traceData)
                //         const traceState = span.context().traceState
                //         if (traceState != null) {
                //             request.setHeader('tracestate', traceState?.serialize())
                //         }
                //     }
                // },
            }),
        ],
    });

    return opentelemetry.trace.getTracer('sample-tracing-app-fe');
};
