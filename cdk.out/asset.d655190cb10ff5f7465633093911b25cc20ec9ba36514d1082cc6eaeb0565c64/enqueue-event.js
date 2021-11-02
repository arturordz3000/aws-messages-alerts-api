
const AWS = require('aws-sdk');
const constants = require('my-constants').constants;

AWS.config.region = constants.region;

const eventbridge = new AWS.EventBridge();

exports.handler = async function(event, context, callback) {
    const payload = JSON.parse(event?.body);

    if (!payload) return;

    const detail = {};
    if (payload.eventType === constants.types.message) {
        detail.message = { value: payload.value };
    } else {
        detail.alert = { value: payload.value };
    }

    const eventBridgeMessage = {
        Entries: [ 
            {
                // Event envelope fields
                Source: 'custom.eventProcessor',
                EventBusName: constants.eventBusName,
                DetailType: payload.eventType,
                Time: new Date(),
        
                // Main event body
                Detail: JSON.stringify(detail)
            }
        ]
    }

    const result = await eventbridge.putEvents(eventBridgeMessage).promise();
    console.log(result);
    callback(null, result);
}