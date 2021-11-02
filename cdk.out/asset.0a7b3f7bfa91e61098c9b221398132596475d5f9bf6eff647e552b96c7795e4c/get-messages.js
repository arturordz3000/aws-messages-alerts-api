exports.handler = async function(event) {
    const responseBody = [
        {
            id: 1,
            text: 'Hello world'
        },
        {
            id: 2,
            text: 'This is a text'
        }
    ];

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(responseBody)
    }
}