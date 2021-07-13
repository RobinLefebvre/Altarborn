/** util/Encryption.js
 * File used for handling encryption and decryption functions used throughout the project.
 * @author Robin Lefebvre
 * @disclaimer This file is not designed to be reproduced or distributed, nor is it useable for creation of content of any kind. 
 * It was made for the personal use of the owner, as it disregards any and all legislation regarding intellectual property. */

 /** Dependencies */
const crypto = require("crypto");

/** @function genSalt generates random string of characters i.e salt
 * @param {Number} length - Length of the random string. */
exports.genSalt = genSalt = (length) => 
{
  return crypto.randomBytes(Math.ceil(length/2))
          .toString('hex') /** convert to hexadecimal format */
          .slice(0,length);/** return required number of characters */
};

/** @function sha512 Hash pass with sha512.
 * @param {String} pass - Plain text password.
 * @param {String} salt - Salt hash. */
exports.sha512 = sha512 = (pass, salt) => 
{
  let hash = crypto.pbkdf2Sync(pass, salt, 1000, 64, `sha512`)
  let value = hash.toString('hex');
  return { salt:salt, hash:value };
};

/** @function encryptPass  Generates random salt then encrypts a given pass with sha512.
 * @param {String} pass - the password to encrypt */
exports.encryptPass = (pass) => 
{
  let salt = genSalt(16);
  return sha512(pass, salt);
}

/** @function validPass Does password correspond to hash in DB ?
 * @param {string} pass - the plain text password to decrypt
 * @param {Object} dbPass - the password hash and salt from database */
exports.validPass = (pass, dbPass) => 
{
  return (dbPass.hash ==  crypto.pbkdf2Sync(pass, dbPass.salt, 1000, 64, `sha512`).toString(`hex`))
}