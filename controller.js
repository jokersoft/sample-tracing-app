const AWS = require('aws-sdk');
AWS.config.update({region: 'eu-west-1'});

const DEFAULT_PORT = '8080';
const PORT = process.env.PORT ?? DEFAULT_PORT;
const SECRET = process.env.SECRET;

const http = require('http');
const express = require('express');
const api = require("@opentelemetry/api");

const authMiddleware = (req, res, next) => {
    const { authorization } = req.headers;
    if (authorization && authorization.includes(SECRET)) {
        console.debug('authorization passed');
        next();
    } else {
        res.sendStatus(403);
    }
};

function gateway() {
    const router = express.Router();
    router.get('/204', (request, response) => {
        response.status(204).send();
    });

    router.get('/s3-list', (request, response) => {
        listS3(request, response);
    });

    router.get('/s2s', (request, response) => {
        s2s(request, response);
    });

    router.get('/health', (request, response) => {
        health(request, response);
    });

    return router;
}

function listS3(request, response) {
    let responseCode = 500;
    let responseMessage = 'Unhandled';

    console.log('inside listS3');
    const s3 = new AWS.S3({apiVersion: '2006-03-01'});
    s3.listBuckets(function (awsError, data) {
        if (awsError) {
            responseMessage = awsError.message;

            if (awsError.code === 'InvalidToken') {
                responseCode = 403;
            } else {
                responseCode = 500;
            }

            return response.status(responseCode).send(responseMessage);
        } else {
            responseCode = 200;
            responseMessage = JSON.stringify(data.Buckets);

            return response.status(responseCode).send(responseMessage);
        }
    });
}

function s2s(globalRequest, globalResponse) {
    const options = {
        hostname: 'localhost',
        port: PORT,
        path: '/health',
        method: 'GET',
    }

    const req = http.request(options, res => {
        let responseData = '';
        res.on('data', function (chunk) {responseData += chunk;});
        res.on('end', function () {
            return globalResponse.status(res.statusCode).send(responseData);
        });
    })

    req.on('error', error => {
        return globalResponse.status(500).send(error.message);
    })
}

function health(request, response) {
    response.status(200).send('{"status":"OK"}');
}

module.exports.health = (request, response) => health(request, response);
module.exports.gateway = gateway;
module.exports.authMiddleware = authMiddleware;
