/** models/Souls.js
* File used for handling the Soul model of the API. It will perform DB tasks related to Soul management.
* @author Robin Lefebvre
* @disclaimer This file is not designed to be reproduced or distributed, nor is it useable for creation of content of any kind. 
* It was made for the personal use of the owner, as it disregards any and all legislation regarding intellectual property. */

/** Dependencies */
const db = require('../db');
const encrypt = require('../utils/encrypt');

module.exports = class Soul
{
  constructor(args)
  {
    this.name = args.name;

    if(!args.pass.salt || !args.pass.hash)
      this.pass = encrypt.encryptPass(args.pass);

    this.allies = args.allies || [];
    this.blocks = args.blocks || [];
    this.hostiles = args.hostiles || [];

    console.log(this)
  }

  /** @function init - handles the creation of the Souls collection at application start-up, assuming the collection does not already exist. See /db.js and the initializeCollections function for more.
  * @returns undefined */
  static async init()
  {
    console.log(`Creating collection of Souls.`)
    db.get().createCollection("souls", {validator : require('./schemas/souls.json')})
  }

  /** @function create - adds a new Soul into database
  * @returns the database response
  * @throws "Soul already exists"  */
  async create()
  {
    try
    {
      console.log(`Creating new Soul ${this.name}.`);
      let soulsCollection = db.get().collection('souls');

      let soulExists = await soulsCollection.findOne({name : this.name})
      if(soulExists !== null) 
        throw new Error("Soul already exists.");

      return (await soulsCollection.insertOne(this))
    }
    catch(error)
    {
      throw error;
    };
  }

  /** @function delete - remove the Soul from database
  * @todo : change param from name to id 
  * @param name - the Soul's name
  * @returns the database response
  * @throws "Empty request parameters", "Soul doesn't exist"  */
  static async delete(name)
  {
    try
    {
      console.log(`Removing Soul ${name}.`);
      let soulsCollection = db.get().collection('souls');

      let soul = await soulsCollection.findOne({name : name})
      if(soul == null) 
        throw new Error("Soul doesn't exists.");

      return (await soulsCollection.removeOne({name: name}))
    }
    catch(error)
    {
      throw error;
    };
  }

  /** @function read - gets the list of Souls based on the passed filters
   * @param {Object} filter - the object used for filtering on the db
   * @returns {Array} List of Soul names
   * @throws "Collection is empty" */
  static async read(filter)
  {
    if(filter === undefined)
    {
      filter = {};
    }
    try 
    {
      console.log('Reading soul collection');
      return (await db.get().collection('souls').find(filter).toArray());
    }
    catch(error)
    {
      throw error;
    }
  }
  /** @function updateRelationship - Manages the addition or removal of Souls into the current Soul's allies and hostiles lists
   * @param {String} action - Action to perform : "ally", "removeAlly", "hostile", "removeHostile"
   * @param {String} name - name of the Soul to deal with
   * @returns current Soul
   * @throws "Missing request parameters", "Soul doesn't exist", "Soul is already/not in your allies/hostiles list" */
  async updateRelationship(action, name)
  {
    try
    {
      let soulsCollection = db.get().collection('souls');

      // Validate request - Action
      let isValidAction = (action !== undefined && (action == "ally" || action == "removeAlly" || action == "block" || action == "removeBlock" || action == "hostile" || action == "removeHostile") )
      if(isValidAction === false )
        throw new Error("Action is invalid.");

      // Validate request - Soul
      let otherSoul = await Soul.read({name : name});
      if(otherSoul === undefined)
        throw new Error("Soul doesn't exist.");

      switch(action)
      {
        case "ally":
          // Add ally if not exist
          if(this.allies.indexOf(name) > -1)
            throw new Error("Soul is already in your allies list.");

          this.allies.push(name);
          (soulsCollection.findOneAndUpdate({"name" : this.name}, {"$push" : { "allies" : name }}));
          break;
          
        case "removeAlly":
          // Remove ally if exists
          let iRa = this.allies.indexOf(name)
          if(iRa == -1)
            throw new Error("Soul is not in your allies list.");

          this.allies.splice(iRa, 1);
          (soulsCollection.findOneAndUpdate({"name" : this.name}, {"$pull": { "allies": name }}) );
          break;

        case "block":
            // Add ally if not exist
            if(this.blocks.indexOf(name) > -1)
              throw new Error("Soul is already in your blocked list.");
  
            this.blocks.push(name);
            (soulsCollection.findOneAndUpdate({"name" : this.name}, {"$push" : { "blocks" : name }}));
            break;
            
        case "removeBlock":
          // Remove ally if exists
          let iRb = this.blocks.indexOf(name)
          if(iRb == -1)
            throw new Error("Soul is not in your blocked list.");

          this.blocks.splice(iRb, 1);
          (soulsCollection.findOneAndUpdate({"name" : this.name}, {"$pull": { "blocks": name }}) );
          break;

        case "hostile":
          // Add hostile if not exists
          if(this.hostiles.indexOf(name) > -1)
            throw new Error("Soul is already in your hostiles list.");
            
          this.hostiles.push(name);
          (soulsCollection.findOneAndUpdate({"name" : this.name}, {"$push" : { "hostiles" : name }}));
          break;

        case "removeHostile":          
          // Remove hostile if exists
          let iRh = this.hostiles.indexOf(name) 
          if(iRh == -1)
            throw new Error("Soul is not in your hostiles list.");
            
          this.hostiles.splice(iRh, 1);
          (soulsCollection.findOneAndUpdate({"name" : this.name}, {"$pull": { "hostiles" : name }} ));
          break;
      }
      return this;
    }
    catch(error)
    {
      throw error;
    }
  }

  /** @function login - checks validity of data against Soul database
   * @param {String} name - the name
   * @param {String} pass - the plain text password 
   * @returns true 
   * @throws Soul doesn't exist, password mismatch  */
  static async login(name, pass)
  {
    try
    {
      console.log(`Login for Soul ${name}.`);
      let soulsCollection = db.get().collection('souls');
      let soul = await soulsCollection.findOne({name : name});

      if(!soul)
        throw new Error("Soul not found.");

      if(soul.pass && soul.pass.salt && soul.pass.hash)
      {
        if(!encrypt.validPass(pass, soul.pass))
          throw new Error("Mismatched password.");
        else
          return {id : soul._id, name : soul.name};
      }
    }
    catch(error)
    {
      throw error;
    }  
  }
}