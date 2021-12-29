const AWS = require('aws-sdk');
AWS.config.update({region: 'eu-west-1'});

const DEFAULT_PORT = '8080';
const PORT = process.env.PORT ?? DEFAULT_PORT;

const api = require('@opentelemetry/api');
const http = require('http');

function listS3(request, response) {
    let responseCode = 500;
    let responseMessage = 'Unhandled';

    console.log('inside listS3');
    const s3 = new AWS.S3({apiVersion: '2006-03-01'});
    s3.listBuckets(function (awsError, data) {
        console.log('inside s3.listBuckets');
        if (awsError) {
            responseMessage = awsError.message;

            if (awsError.code === 'InvalidToken') {
                responseCode = 403;
            } else {
                responseCode = 500;
            }
        } else {
            responseCode = 200;
            responseMessage = JSON.stringify(data.Buckets);
        }
    });

    return response.status(responseCode).send(responseMessage);
}

function s2s(request, response) {
    console.log('callS2S hit');
    const options = {
        hostname: 'localhost',
        port: PORT,
        path: '/health',
        method: 'GET',
    }

    console.log('http.get(options);');
    const result = http.get(options);

    return response.status(200).send(JSON.stringify(result));
}

function health(request, response) {
    response.status(200).send('{"status":"OK"}');
}

module.exports.listS3 = (request, response) => listS3(request, response);
module.exports.s2s = (request, response) => s2s(request, response);
module.exports.health = (request, response) => health(request, response);
