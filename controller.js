const DEFAULT_PORT = '3000';
const http = require('http');
const AWS = require('aws-sdk');

const api = require('@opentelemetry/api');
const tracerFE = require('./tracer-fe')('sample-tracing-app-fe');
const tracerBE = require('./tracer-be')('sample-tracing-app-be');

AWS.config.update({region: 'eu-west-1'});
const port = process.env.PORT ?? DEFAULT_PORT;

const httpCall = (request, response, subCall) => {
    const options = {
        headers: {
            'Content-Type': 'application/json',
        },
        hostname: 'localhost',
        port: port,
        path: '/' + subCall,
        method: 'GET',
    }

    const span = tracerFE.startSpan('simulateHttpCall', {
        kind: 2, // client
        attributes: { key: 'value-fe' },
    });

    // Annotate our span to capture metadata about the operation
    span.addEvent('invoking httpCall');

    let responseData = '';
    const outgoingRequest = http.request(options, outgoingResponse => {
        outgoingResponse.on('data', (chunk) => {
            responseData += chunk;
            console.log(responseData);
        });
    })
    outgoingRequest.on('error', error => {
        console.error(error);
    })
    outgoingRequest.end();

    span.end();

    return response.status(202).json(responseData);
}

const listS3 = (request, response) => {
    // const parentSpan = api.trace.getSpan(api.context.active());
    // console.log(`parentSpan: ${currentSpan.spanContext().traceId}`);
    // return response.send(JSON.stringify(request.headers));

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
            console.log('err:');
            console.log((JSON.stringify(err)));
            return response.send(JSON.stringify(err));
        } else {
            console.log('data:');
            console.log((JSON.stringify(data.Buckets)));
            return response.send(JSON.stringify(data.Buckets));
        }
    });
}

module.exports.httpCall = (request, response, subCall) => { return httpCall(request, response, subCall); }
module.exports.listS3 = (request, response) => { return listS3(request, response); }
