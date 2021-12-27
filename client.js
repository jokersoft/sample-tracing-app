const DEFAULT_LISTEN_PORT = '3000';
const DEFAULT_SERVER_PORT = '8080';

const LISTEN_PORT = process.env.LISTEN_PORT ?? DEFAULT_LISTEN_PORT;
const SERVER_PORT = process.env.SERVER_PORT ?? DEFAULT_SERVER_PORT;
const SERVER_HOST = process.env.SERVER_HOST;

const express = require('express');
const app = express();
const tracerFe = require('./tracer-fe')('sample-tracing-app-fe');
const api = require('@opentelemetry/api');
const axios = require('axios').default;

app.get('/http/:subCall', (request, response) => {
    console.log('http EP hit');
    const options = {
        headers: {
            'Content-Type': 'application/json',
        },
        hostname: process.env.SERVER_HOST,
        port: SERVER_PORT,
        path: '/' + request.params.subCall,
        method: 'GET',
    }

    const span = tracerFe.startSpan('simulateHttpCall', {
        kind: api.SpanKind.CLIENT,
        attributes: { key: 'value-fe' },
    });

    // Annotate our span to capture metadata about the operation
    span.addEvent('invoking httpCall');

    let responseData = '';

    api.context.with(api.trace.setSpan(api.ROOT_CONTEXT, span), async () => {
        try {
            const res = await axios.get(`http://${SERVER_HOST}:${SERVER_PORT}/s3-list`);
            console.log('status:', res.statusText);
            console.log('client response headers: ', JSON.stringify(res.headers));
            span.setStatus({ code: api.SpanStatusCode.OK });
        } catch (e) {
            console.log('failed:', e.message);
            console.log('client response headers: ', JSON.stringify(res.headers));
            span.setStatus({ code: api.SpanStatusCode.ERROR, message: e.message });
        }
        span.end();
    });

    return response.status(202).json(responseData);
})

const server = app.listen(LISTEN_PORT, function () {
    const host = server.address().address
    const port = server.address().port
    console.log("Client is listening at http://%s:%s", host, port)
})
