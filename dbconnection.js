const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI;

// Connect to the database, then calls any supplied callback with the database connection
async function main(cb) {
  // Use connect method to connect to the server
  try {
    const dbClient = await new MongoClient(MONGO_URI).connect();
    await cb(dbClient);
    console.log('Connected to database successfully');
  } catch (err) {
    console.log('Error when connecting to database: ', err);
    throw new Error('Unable to Connect to Database');
  }
}

module.exports = main;
