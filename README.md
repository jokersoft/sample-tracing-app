# Sample Tracing App (Node.js + Opentelemetry Collector + Zipkin) with instrumentation examples

## local run
Run containers:
```shell
docker compose build
docker compose up
```
(requires you to be [authenticated in AWS cli](infrastructure/documentation/aws-cli-auth.md))

Simulate API call chain (client -> server -> aws.s3.list):
```shell
curl localhost:3000/http/s3-list -v
```

### To see traces in Zipkin UI
go to `http://localhost:9411/zipkin/`, press "RUN QUERY" button to see latest traces.

And check [zipkin-ui.md](infrastructure/documentation/zipkin-ui.md) for more details.

### To see traces in Jaeger UI
go to `http://localhost:16686` and search.

# Links

### http instrumentation
https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-http

### OpenTelemetry Collector Exporter for web and node
https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-exporter-trace-otlp-http

### OpenTelemetry Collector Exporter for node with grpc
https://www.npmjs.com/package/@opentelemetry/exporter-collector-grpc

### OpenTelemetry Protocol Specification

#### OTLP/HTTP
https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/otlp.md#otlpgrpc-default-port

### B3 Header Propagation
https://www.npmjs.com/package/@opentelemetry/propagator-b3
https://github.com/openzipkin/b3-propagation
https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-propagator-b3

## TODO
- add draw.io to readme
- investigate [Sentry exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/sentryexporter)
- add [Grafana](https://grafana.com/grafana/plugins/grafana-x-ray-datasource/)
- implement response header (`traceId`)
- implement logging of `traceId`
- deploy [zpages extension](https://github.com/open-telemetry/opentelemetry-collector/blob/main/extension/zpagesextension/README.md)
