/** app.js 
 * File used for handling the incoming requests dedicated to the API and passing them through routing
 * @author Robin Lefebvre
 * @disclaimer This file is not designed to be reproduced or distributed, nor is it useable in content of any kind. It should be for the personal use of the owner, as it disregards any and all legislation regarding copyrighted code. */

/******************************************* Server start *******************************************/
console.log("Starting Server.");
const express = require('express'); // - Express (server & routing)
const app = express();
const db = require('./db'); // - Custom MongoDB connector (database)
db.connect();
app.listen(6060, () => { console.log('Listening to routes on localhost:6060.\n'); });
/** Middleware routing - each request that the API receives will go through the following sequence of middleware */
/** Body Parser */
app.use(express.json());
/** Set CORS headers for response */
const responseHandler = require('./middleware/responseHandler'); // - Response Handler (custom middleware for routing logic)
app.use(responseHandler.handleCors);
/** Console Logs - Morgan */
const morgan = require('morgan'); // - Morgan for loggin API requests
morgan.token('sessionid', function(req) {return req.sessionID;});
morgan.token('user', function(req) {if(req.session && req.session.soul && req.session.soul.name){ return req.session.soul.name} return "Anonymous User";});
app.use(morgan(`\n[-- :date --]\n :user - :sessionid @ :remote-addr \n - :method \t\t- :url \n - Response Status \t- :status \n - Response Size \t- :res[content-length] bytes \n - Response Time \t- :response-time ms\n`)); 
/** Sessions management */
const session = require('express-session'); // - Express Session (cookies & sessions)
app.use(session( { secret : 'projectSecret', saveUninitialized: true, resave: true, cookie: { httpOnly: false, sameSite: false, maxAge: 60000000 } } )); 
/** Controllers routing - c.f. _init/routes.js for configuring the routes and controllers */
const init = require('./config/routes');
init.routes.forEach((route) => { app.use(route.name, route.req) });
/** Error log and response */
app.use(responseHandler.respondError);
/** Respond 404 on the rest of the server */
app.use(responseHandler.respond404);