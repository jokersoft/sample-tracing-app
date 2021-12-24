const express = require('express');
const app = express();
const controller = require('./controller');

app.get('/http/:subCall', (request, response) => {
    controller.httpCall(request, response, request.params.subCall);
})

app.get('/s3-list', (request, response) => {
    console.log(JSON.stringify(request.headers));
    controller.listS3(request, response);
})

const server = app.listen(3000, function () {
    const host = server.address().address
    const port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
})
