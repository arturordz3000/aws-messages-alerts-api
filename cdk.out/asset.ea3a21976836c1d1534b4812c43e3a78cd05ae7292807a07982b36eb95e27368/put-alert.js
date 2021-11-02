const service = require('service');
const constants = require('my-constants').constants;

exports.handler = async function(event, context, callback) {
    const payload = getPayload(event);
    await service.putEvent(payload, constants.types.alert, callback);
}

function getPayload(event) {
    if (event?.DetailType && event?.Detail) {
        return event.Detail;
    }

    return event.body;
}