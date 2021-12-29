const DEFAULT_LISTEN_PORT = '3000';
const DEFAULT_SERVER_PORT = '8080';

const LISTEN_PORT = process.env.LISTEN_PORT ?? DEFAULT_LISTEN_PORT;
const SERVER_PORT = process.env.SERVER_PORT ?? DEFAULT_SERVER_PORT;
const SERVER_HOST = process.env.SERVER_HOST;

const express = require('express');
const app = express();
const tracerFe = require('./tracer-fe')('client');
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

    api.context.with(api.trace.setSpan(api.ROOT_CONTEXT, span), async (responseData, responseCode) => {
        try {
            const res = await axios.get(`http://${SERVER_HOST}:${SERVER_PORT}/s3-list`);

            span.setStatus({ code: api.SpanStatusCode.OK });
            span.end();

            responseData = res.data;
            responseCode = 202;

            return response.status(responseCode).send(responseData);
        } catch (e) {
            console.error('with: ', JSON.stringify(e));
            span.setStatus({ code: api.SpanStatusCode.ERROR, message: e.message });
            span.end();

            return response.status(500).send(e.message);
        }
    });
})

const server = app.listen(LISTEN_PORT, function () {
    const host = server.address().address
    const port = server.address().port
    console.log("Client is listening at http://%s:%s", host, port)
})
