const express = require('express');
const app = express();
const controller = require('./controller');

app.get('/s3-list', (request, response) => {
    console.log(JSON.stringify(request.headers));
    controller.listS3(request, response);
})

app.get('/http', (request, response) => {
    controller.httpCall(request, response);
})

const apiServer = app.listen(3000, function () {
    const host = apiServer.address().address
    const port = apiServer.address().port
    console.log("Example app listening at http://%s:%s", host, port)
})