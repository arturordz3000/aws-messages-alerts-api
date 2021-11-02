exports.getPutPayload = function(event) {
    if (event && event['detail-type'] && event.detail) {
        return event.detail;
    }
    
    return JSON.parse(event.body);
}

exports.getGetParameters = function(event) {
    return {
        id: event?.pathParameters?.id,
        start: event?.queryStringParameters?.start,
        end: event?.queryStringParameters?.end
    }
}

exports.generateSuccessResponse = function(body) {
    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: body,
    };
}

exports.generateErrorResponse = function(error) {
    return {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain', "Access-Control-Allow-Origin": "*" },
        body: error.message || 'Unknown error',
    }
}