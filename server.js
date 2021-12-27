'use strict';

const DEFAULT_PORT = '8080';
const PORT = process.env.PORT ?? DEFAULT_PORT;

require('./tracer-be')('sample-tracing-app-be');
const controller = require('./controller');

const express = require('express');
const app = express();
const AWS = require("aws-sdk");
const axios = require('axios').default;

app.use(express.json());
app.get('/health', (request, response) => response.status(200).send("HEALTHY"));
app.get('/s3-list', async (request, response) => {
  console.log('server request.headers:');
  console.log(JSON.stringify(request.headers));

  // controller.listS3(request, response)

  const s3 = new AWS.S3({apiVersion: '2006-03-01'});
  s3.listBuckets(function(err, data) {
    if (err) {
      console.log('err:');
      console.log((JSON.stringify(err)));
      return response.status(500).send(JSON.stringify(err));
    } else {
      console.log('data:');
      console.log((JSON.stringify(data.Buckets)));
      return response.status(200).send(JSON.stringify(data.Buckets));
    }
  });
});

const server = app.listen(PORT, () => {
  const host = server.address().address
  const port = server.address().port
  console.log("Server is listening at http://%s:%s", host, port)
});
