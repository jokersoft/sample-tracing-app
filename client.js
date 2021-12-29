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

app.get('/http/:subCall', (globalRequest, globalResponse) => {
    console.log('http EP hit');
    const options = {
        headers: {
            'Content-Type': 'application/json',
        },
        hostname: process.env.SERVER_HOST,
        port: SERVER_PORT,
        path: '/' + globalRequest.params.subCall,
        method: 'GET',
    }

    const span = tracerFe.startSpan('simulateClientHttpCall', {
        kind: api.SpanKind.CLIENT,
        attributes: { key: 'value-fe' },
    });

    // Annotate our span to capture metadata about the operation
    span.addEvent('invoking httpCall');

    axios.get(`http://${SERVER_HOST}:${SERVER_PORT}/s3-list`)
        .then(response => {
            span.setStatus({ code: api.SpanStatusCode.OK });
            span.end();

            return globalResponse.status(202).send(response.data);
        })
        .catch(error => {
            span.setStatus({ code: api.SpanStatusCode.ERROR, message: error.message });
            span.end();

            return globalResponse.status(500).send(error.message);
        });
})

const server = app.listen(LISTEN_PORT, function () {
    const host = server.address().address
    const port = server.address().port
    console.log("Client is listening at http://%s:%s", host, port)
})
