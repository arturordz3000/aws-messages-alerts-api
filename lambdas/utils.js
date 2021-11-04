exports.getPutPayload = function(event) {
    if (event && event['detail-type'] && event.detail) {
        return event.detail;
    }
    
    return JSON.parse(event.body);
}

exports.getGetParameters = function(event) {
    const params = {
        id: event?.pathParameters?.id,
        start: event?.queryStringParameters?.start,
        end: event?.queryStringParameters?.end
    }

    if (params.start) {
        params.start = parseInt(params.start);
    }

    if (params.end) {
        params.end = parseInt(params.end);
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