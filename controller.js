const AWS = require('aws-sdk');
AWS.config.update({region: 'eu-west-1'});

function listS3(request, response) {
    console.log('inside listS3');
    const s3 = new AWS.S3({apiVersion: '2006-03-01'});
    s3.listBuckets(function(err, data) {
        console.log('inside s3.listBuckets');
        if (err) {
            console.log('err:');
            console.log((JSON.stringify(err)));
            return JSON.stringify(err);
        } else {
            console.log('data:');
            console.log((JSON.stringify(data.Buckets)));
            return JSON.stringify(data.Buckets);
        }
    });
}

module.exports.listS3 = (request, response) => listS3(request, response);
