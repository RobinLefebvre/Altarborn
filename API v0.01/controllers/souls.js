/** controllers/Souls.js
* File used for handling the requests related to Soul management.
* @author Robin Lefebvre
* @disclaimer This file is not designed to be reproduced or distributed, nor is it useable for creation of content of any kind. 
* It was made for the personal use of the owner, as it disregards any and all legislation regarding intellectual property. */

/** Dependencies */
const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth');

/** Models */
const Soul = require('../models/souls');

/** POST - adds the Soul into the database
 * @param {Object} request.body - {name : String, pass : String} */
router.post('/create', async (request, response, next) => 
{
  try 
  {
    let b = request.body;
    let soul = new Soul(b);
    await soul.create();
    response.status(200).send(soul);
  } 
  catch(error)
  {
    console.log(error.message)
    next(error);
  }
}); 

/** POST - removes the Soul into the database
 * @middleware auth
 * @todo - make and use adminAuth middleware
 * @param request.body.name - the Soulname*/
router.post('/delete', async (request, response, next) => 
{
  try 
  {
    await Soul.delete(request.body.name);
    response.status(200).send({"message" : `Soul ${request.body.name} was deleted.`});
  } 
  catch(error)
  {
    console.log(error.message)
    next(error);
  }
}); 

/** GET - gets the Soul data from the database, based on name
 * @param request.body.name - the Soul's name */
router.get('/get', async (request, response, next) => 
{
  try
  {
    let name = request.query.name;
    let result = await Soul.read({"name" : name})
    if(result)
      response.status(200).send(result)
  }
  catch (error) 
  {
    console.log(error.message)
    next(error);
  }
}); 

/** GET - gets the whole list of Souls from the database */
router.get('/all', async (request, response, next) => 
{
  try
  {
    let result = await Soul.read();
    response.status(200).send(result);
  }
  catch(error)
  {
    console.log(error.message)
    next(error);
  }
}); 

/** POST - Manages the addition or removal of Souls into the current Soul's Friends and Blocked lists
 * @middleware auth 
 * @param request.body.action - Action to perform : "ally", "removeAlly", "block", "removeBlock", "hostile", "removeHostile"
 * @param request.body.name - name of the Soul to deal with */
router.post('/updateRelationship', auth, async (request, response, next) => 
{
  try 
  {    
    let q = await Soul.read({name : request.session.soul.name});
    if(q[0] !== undefined && q[0].name === request.session.soul.name)
    {
      let cSoul = new Soul(q[0]);
      let result = await cSoul.updateRelationship(request.body.action, request.body.name);
      response.status(200).send(result);
    }
  }
  catch(error)
  {
    console.log(error.message)
    next(error);
  }
}); 

/** POST - checks login for given Soul input
 * @param request.body.name - the Soul's name
 * @param request.body.pass - the plain text password */
router.post('/login', async (request, response, next) => 
{
  if(!request.session.soul)
  {
    let name = request.body.name;
    let pass = request.body.pass;
    if(!name || !pass)
      next({"message" : "Missing request parameters."});
    if(name == "" || pass == "")
      next({"message" : "Empty request parameters."});
  
    try
    {
      let result = await Soul.login(name, pass);
      if(result)
      {
        request.session.soul = result;
        response.status(200).send(request.session);
      }
      next();
    }
    catch (error)
    {
      console.log(error.message)
      next(error);
    }
  }
  else
  {
    response.status(200).send(request.session);
  }
});


/** POST - logout current session Soul */
router.post('/logout', (request, response, next) => 
{
  if(request.session && request.session.soul)
  {    
    console.log(`Killing session for ${request.session.soul.name}.`);
    request.session.destroy((error) => 
    {
      if(error)
        next(error);
      else
        response.status(200).send({"message" : "Logout successful."});
    })
  }
  else
  {
    console.log(`Attempting to logout without session.`);
    response.status(200).send({"message" : "Attempting to logout without session."});
  }
});

/** Export router */
module.exports = router;