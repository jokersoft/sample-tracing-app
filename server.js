'use strict';

const SECRET = process.env.SECRET;

const DEFAULT_PORT = '8080';
const PORT = process.env.PORT ?? DEFAULT_PORT;

require('./tracer-be')('server');
const controller = require('./controller');

const express = require('express');
const app = express();
const axios = require('axios').default;

const authMiddleware = (request, response, next) => {
  const { authorization } = request.headers;
  console.log()
  if (authorization && authorization.includes(SECRET)) {
    console.log('auth passed, proceeding to next middleware');
    next();
  } else {
    console.log('auth failed, returning 401');
    response.sendStatus(401);
  }
};

app.use(express.json());
// app.use('/s3-list', authMiddleware, controller.getCrudController());

app.get('/health', (request, response) => response.status(200).send("HEALTHY"));
app.get('/s3-list', async (request, response) => {
  console.log('server request.headers:');
  console.log(JSON.stringify(request.headers));

  const result = controller.listS3();

  return response.status(200).send(JSON.stringify(result));
});

const server = app.listen(PORT, () => {
  const host = server.address().address
  const port = server.address().port
  console.log("Server is listening at http://%s:%s", host, port)
});
