const service = require('service');
const constants = require('my-constants').constants;
const utils = require('utils');
const axios = require('axios');

exports.handler = async function(event, context, callback) {
    try {
        console.log(JSON.stringify(event));
        const payload = utils.getPutPayload(event);
        const dynamoDBId = await service.putEvent(payload, constants.types.alert, callback);
        await sendToSlack(constants.types.alert, payload[constants.types.alert].value);

        callback(null, utils.generateSuccessResponse(JSON.stringify({ id: dynamoDBId })));
    } catch (error) {
        callback(null, utils.generateErrorResponse(error));
    }
}

async function sendToSlack(eventType, value) {
    const url = 'https://slack.com/api/chat.postMessage';
    const res = await axios.post(url, {
        channel: '#test',
        text: `${eventType} received: ${value}`
    }, { headers: { authorization: `Bearer ${constants.slackToken}` } });
    console.log(res);
}