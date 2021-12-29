const DEFAULT_LISTEN_PORT = '3000';
const DEFAULT_SERVER_PORT = '8080';

const LISTEN_PORT = process.env.LISTEN_PORT ?? DEFAULT_LISTEN_PORT;
const SERVER_PORT = process.env.SERVER_PORT ?? DEFAULT_SERVER_PORT;
const SERVER_HOST = process.env.SERVER_HOST;

const express = require('express');
const app = express();
const tracerFe = require('./tracer-fe')('client');
const api = require('@opentelemetry/api');
const http = require("http");

app.get('/http/:subCall', (globalRequest, globalResponse) => {
    console.log('http EP hit');
    const options = {
        headers: {
            'Content-Type': 'application/json',
        },
        hostname: SERVER_HOST,
        port: SERVER_PORT,
        path: '/' + globalRequest.params.subCall,
        method: 'GET',
    }

    // Start manual span
    const span = tracerFe.startSpan('simulateclienthttpcall', {
        kind: api.SpanKind.CLIENT,
        attributes: { key: 'value-fe' },
    });

    // Annotate our span to capture metadata about the operation
    span.addEvent('invoking httpCall');

    const req = http.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)
        let responseData = '';
        res.on('data', function (chunk) {responseData += chunk;});
        res.on('end', function () {
            span.setStatus({ code: api.SpanStatusCode.OK });
            // End manual span
            span.end();

            return globalResponse.status(202).send(responseData);
        });
    })

    req.on('error', error => {
        console.error('error: ');
        console.error(error);
        span.setStatus({ code: api.SpanStatusCode.ERROR, message: error.message });
        // End manual span
        span.end();

        return globalResponse.status(500).send(error.message);
    })

    req.end()
})

const server = app.listen(LISTEN_PORT, function () {
    const host = server.address().address
    const port = server.address().port
    console.log("Client is listening at http://%s:%s", host, port)
})
