const http = require('http');
const AWS = require('aws-sdk');

const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const provider = new NodeTracerProvider();
provider.register();

registerInstrumentations({
    instrumentations: [
        new ExpressInstrumentation(),
        new HttpInstrumentation({
            requestHook: (span, request) => {
                span.setAttribute("custom request hook attribute", "request");
            },
        }),
    ],
});

AWS.config.update({region: 'eu-west-1'});

const listS3 = (request, response) => {
    let s3 = new AWS.S3({apiVersion: '2006-03-01'});

    s3.listBuckets(function(err, data) {
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
        port: 3000,
        path: '/s3-list',
        method: 'GET'
    }

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

    return response.send('');
}

module.exports.listS3 = (request, response) => { return listS3(request, response); }
module.exports.httpCall = (request, response) => { return httpCall(request, response); }
