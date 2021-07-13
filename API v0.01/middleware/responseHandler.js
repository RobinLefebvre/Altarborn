/** middleware/responseHandler.js
* File used for exposing middleware functions that handle response management from the server. 
 - CORS headers for all responses 
 - Error responses management - Sends back error messages to API when using "next(error)" in routing
 - 404 responses - Sends back 404 response when no routing was found.

* @author Robin Lefebvre
* @disclaimer This file is not designed to be reproduced or distributed, nor is it useable for creation of content of any kind. 
* It was made for the personal use of the owner, as it disregards any and all legislation regarding intellectual property. */

/** @function handleCors - Sets headers for responses */
exports.handleCors = (request, response, next) => 
{
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization");

    if (request.method === 'OPTIONS') 
    {
        response.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return response.status(200).json({});
    }
    next();
}

/** @function respondError - When error is found passed down in the routing, this middleware will trigger and send response and log. */
exports.respondError = (error, request, response, next) => 
{
    response.status(error.status || 500);
    console.log(error);
    response.json({ message : error.message, status : error.status })
}
/** @function respond404 - At the end of routing, if no middleware sent a response, we send 404 back */
exports.respond404 = (request, response, next) => 
{
    response.status(404);
    response.end();
}