const { MongoClient } = require("mongodb"); // or const MongoClient = require('mongodb').MongoClient

const url =
  process.env.MONGO_URL ||
  "mongodb+srv://mdhusainthekiya:Hussain123@clustermht.fye0n.mongodb.net/NewsAPI?retryWrites=true&w=majority";
const client = new MongoClient(url);

module.exports = { client };
