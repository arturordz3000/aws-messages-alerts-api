const service = require('service');
const constants = require('my-constants').constants;
const utils = require('utils');
var AWS = require('aws-sdk');
AWS.config.update({region: constants.region});
var s3 = new AWS.S3({apiVersion: '2006-03-01'});

exports.handler = async function(event, context, callback) {
    try {
        console.log(JSON.stringify(event));
        const payload = utils.getPutPayload(event);
        const dynamoDBId = await service.putEvent(payload, constants.types.message, callback);
        await sendToS3(dynamoDBId, JSON.stringify(payload));

        callback(null, utils.generateSuccessResponse(JSON.stringify({ id: dynamoDBId })));
    } catch (error) {
        callback(null, utils.generateErrorResponse(error));
    }
}

async function sendToS3(dynamoDBId, value) {
    var uploadParams = {Bucket: constants.bucketName, Key: `${dynamoDBId}.json`, Body: value};
    await s3.upload(uploadParams).promise();
}