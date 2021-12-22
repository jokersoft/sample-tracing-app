const DEFAULT_PORT = '3000';
const http = require('http');
const AWS = require('aws-sdk');

const api = require('@opentelemetry/api');
const tracerFE = require('./tracer-be')('sample-tracing-app-fe');
const tracerBE = require('./tracer-be')('sample-tracing-app-be');

AWS.config.update({region: 'eu-west-1'});
const port = process.env.PORT ?? DEFAULT_PORT;

const listS3 = (request, response) => {
    // TODO: get current span
    // const currentSpan = api.trace.getSpan(api.context.active());
    // console.log(`traceid: ${currentSpan.spanContext().traceId}`);
    const span = tracerBE.startSpan('listS3', {
        kind: 1, // server
        attributes: { key: 'value-be' },
    });
    // Annotate our span to capture metadata about the operation
    span.addEvent('invoking listS3');

    let s3 = new AWS.S3({apiVersion: '2006-03-01'});

    s3.listBuckets(function(err, data) {
        span.end();
        if (err) {
            return response.send(JSON.stringify(err));
        } else {
            return response.send(JSON.stringify(data.Buckets));
        }
    });
}

const httpCall = (request, response) => {
    const options = {
        hostname: 'localhost',
        port: port,
        path: '/s3-list',
        method: 'GET'
    }

    const span = tracerFE.startSpan('httpCall', {
        kind: 2, // client
        attributes: { key: 'value-fe' },
    });
    // Annotate our span to capture metadata about the operation
    span.addEvent('invoking httpCall');

    const req = http.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)

        res.on('data', d => {
            process.stdout.write(d);
        })
    })

    req.on('error', error => {
        console.error(error);
    })

    req.end();
    span.end();

    return response.send('');
}

module.exports.listS3 = (request, response) => { return listS3(request, response); }
module.exports.httpCall = (request, response) => { return httpCall(request, response); }
