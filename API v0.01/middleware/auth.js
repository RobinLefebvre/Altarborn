/** middlewares/auth.js
* Function used as middleware to verify whether or not there is an active session with the request.
* Use this as middleware function for controller requests that require logged in user.
* @author Robin Lefebvre
* @disclaimer This file is not designed to be reproduced or distributed, nor is it useable for creation of content of any kind. 
* It was made for the personal use of the owner, as it disregards any and all legislation regarding intellectual property. */


module.exports = (request, response, next) => 
{
  if (request.session && request.session.soul) 
  {
    console.log(request.session.soul);
    next();
  } 
  else 
  {
    response.status(401).send({"message" : "This route is protected. Please login."});
  }
}