/** db.js
* File used for exposing connection to database. 
* Also contains initialization and utility functionality on the MongoDB.
* @author Robin Lefebvre
* @disclaimer This file is not designed to be reproduced or distributed, nor is it useable for creation of content of any kind. 
* It was made for the personal use of the owner, as it disregards any and all legislation regarding intellectual property. */

/** DB holder */
var state = { db : null };

/** @function get - Exposes the database
 * @returns The content of the Singleton-like db state */
exports.get = () => 
{
  return state.db;
}

/** @function connect - Creates MongoDB connection and stores it in the global holder
 * @param {String} url - Connection path
 * @param {Object} options - Connection options (useUnifiedTypology, ...)
 * @param {Function} callback - Callback defined to redirect errors and results 
 * @returns The DB connection */
exports.connect = async () =>
{
  console.log("Connecting server to MongoDB.");
  const MongoClient = require('mongodb').MongoClient;
  const config = require('./config/db'); 
  try
  {
    MongoClient.connect(config.dbURL, config.dbConnectOption, async (error, result) => 
    {
      if(error) throw new Error(error);
      state.db = result.db(config.dbName);
      await this.initializeCollections(config.requiredCollections);
    });
  }
  catch(error)
  {
    throw error;
  }
}

/** @function initializeCollections - Checks that the given Collection names exist, creates them if not
 * @param {Array} collections - List of collections
 * @returns undefined */
exports.initializeCollections = async (list) => 
{
  let collections = (await state.db.listCollections().toArray()).map(collection => collection.name);
  for(let i = 0; i < list.length; i++)
  {
    if(collections.indexOf(list[i]) == -1)
    {
      let model = require('./models/'+list[i]);
      if(model.init)
      {
        model.init()
      }
      else
      {
        console.log(`Creating ${list[i]} Collection.`);
        await state.db.createCollection(list[i])
      }
    }
  }
}

/** @function close - Closes the MongoDB connection
 * @param {Function} callback - Callback defined to redirect errors and results 
 * @returns undefined */
exports.close = async (callback) => 
{
  if(state.db)
  {
    await state.db.close((error, result) => 
    {
      state.db = null;
      state.mode = null;
      callback(error, result);
    })
  }
}