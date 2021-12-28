'use strict';

const DEFAULT_PORT = '8080';
const PORT = process.env.PORT ?? DEFAULT_PORT;

require('./tracer-be')('server');
const controller = require('./controller');

const express = require('express');
const app = express();
const axios = require('axios').default;

app.use(express.json());

app.get('/health', (request, response) => response.status(200).send("HEALTHY"));
app.get('/s3-list', async (request, response) => {
  console.log('server request.headers:');
  console.log(JSON.stringify(request.headers));

  // HERE: after this movement of code 2 trace spans goes missing (7 vs 9)
  const result = controller.listS3();

  return response.status(200).send(JSON.stringify(result));
});

const server = app.listen(PORT, () => {
  const host = server.address().address
  const port = server.address().port
  console.log("Server is listening at http://%s:%s", host, port)
});
