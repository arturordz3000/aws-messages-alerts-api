const service = require('service');
const constants = require('my-constants').constants;
const utils = require('utils');

exports.handler = async function(event, context, callback) {
    try {
        console.log(JSON.stringify(event));
        const { id, start, end } = utils.getGetParameters(event);
        const items = await service.getEvent(id, start, end, constants.types.alert, callback);

        callback(null, utils.generateSuccessResponse(JSON.stringify(items)));
    } catch (error) {
        callback(null, utils.generateErrorResponse(error));
    }
}