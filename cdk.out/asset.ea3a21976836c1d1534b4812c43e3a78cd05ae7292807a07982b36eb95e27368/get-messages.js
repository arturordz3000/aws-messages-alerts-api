const service = require('service');
const constants = require('my-constants').constants;

exports.handler = async function(event, context, callback) {
    const { id, start, end } = getParams(event);
    await service.getEvent(id, start, end, constants.types.message, callback);
}

function getParams(event) {
    return {
        id: event?.queryStringParameters?.id,
        start: event?.pathParameters?.start,
        end: event?.pathParameters?.end
    }
}