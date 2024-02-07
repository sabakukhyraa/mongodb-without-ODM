require("dotenv").config();
const { MongoClient } = require("mongodb");
let dbConnection;

module.exports = {
  connectToDb: (cb) => {
    MongoClient.connect(process.env.DB_URI)
      .then((client) => {
        dbConnection = client.db("bookstore");
        return cb();
      })
      .catch((err) => {
        console.log(err);
        return cb(err);
      });
  },
  getDb: () => dbConnection,
};
