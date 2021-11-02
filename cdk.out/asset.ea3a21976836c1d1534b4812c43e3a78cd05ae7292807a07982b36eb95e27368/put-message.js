const service = require('service');
const constants = require('my-constants').constants;

exports.handler = async function(event, context, callback) {
    const payload = getPayload(event);
    await service.putEvent(payload, constants.types.message, callback);
}

function getPayload(event) {
    if (event?.detailType && event?.detail) {
        return event.detail;
    }
    
    return event.body;
}