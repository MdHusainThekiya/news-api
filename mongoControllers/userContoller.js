const mongoClient = require("../mongoClient");
const mongodb = require("mongodb");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const { raw } = require("express");
const databaseName = process.env.DATABASE_NAME || "NewsAPI";
const collectionName = "userDb";

// create userDb collection
async function userDbConnect() {
  try {
    let connecting = await mongoClient.client.connect();
    return connecting.db(databaseName).collection(collectionName);
  } catch (error) {
    console.log("failed to connect with user database =>", error.message);
    return res.status(400).send({
      message: "failed to connect with user database",
      totalCount: 0,
      status: error.message || [],
    });
  }
}

// READ userDb Data
const readData = async (req, res) => {
  try {
    let rawData = await userDbConnect();
    let processedData = await rawData.find().toArray();

    if (processedData && Object.keys(processedData).length > 0) {
      console.log("user data =>", processedData);
      return res.status(200).send({
        message: "user data fetch successfully",
        totalCount: processedData.length || 0,
        status: processedData || [],
      });
    } else {
      console.log(processedData);
      return res.status(404).send({
        message: "user data not found",
        totalCount: processedData.length || 0,
        status: [processedData, "zero entries in user database"] || [],
      });
    }
  } catch (error) {
    console.log("unable to get user data =>", error.message);
    return res.status(404).send({
      message: "user data Not Found",
      totalCount: error.length || 0,
      status: error.message || [],
    });
  }
};

// Create userDb Data // NOTE: for createData, inputs are seperately validated in middleware.
const createData = async (req, res) => {
  try {
    let rawData = await userDbConnect();
    const salt = await bcrypt.genSalt(10);
    let processedData = await rawData.insertOne({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, salt),
      isAdmin: req.body.isAdmin || false,
    });
    console.log("created user data =>", processedData);
    return res.status(201).send({
      message: "user data created successfully",
      totalCount: Object.keys(req.body).length || 0,
      status: [processedData, await rawData.findOne({ email : req.body.email })] || [],
    });
  } catch (error) {
    console.log("unable to post/create user =>", error.message);
  }
};

// Update
const updateData = async (req, res) => {
  try {
    const token = req.header("token");
    const decode = jsonwebtoken.verify(token, process.env.JWT_SECRET_KEY);
    let rawData = await userDbConnect();
    let findUserDataByEmailInDb = await rawData.findOne({
      email: decode.email,
    });
    if (
      findUserDataByEmailInDb._id.toString() ===
      new mongodb.ObjectId(req.params.id).toString()
    ) {
      const salt = await bcrypt.genSalt(10);
      let processedData = await rawData.updateOne(
        { _id: new mongodb.ObjectId(req.params.id) },
        {
          $set: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, salt),
            isAdmin: req.body.isAdmin || false,
          },
        }
      );
      console.log("updated user data =>", processedData);
      return res.status(201).send({
        message: "user data updated successfully",
        totalCount: Object.keys(req.body).length || 0,
        status: [processedData, await rawData.findOne({ email : req.body.email })] || [],
      });
    } else {
      console.log(
        "user logged In & user under update/edit operation are different"
      );
      return res.status(401).send({
        message:
          "user logged In & user under update/edit operation are different",
        totalCount: 0,
        status:
          'Object ID provided in "req.param.id" & ID of logged in user are different',
      });
    }
  } catch (error) {
    console.log("unable to put/update user =>", error.message);
  }
};

// Delete
const deleteData = async (req, res) => {
  try {
    let rawData = await userDbConnect();
    let findObjectById = await rawData.findOne({
      _id: new mongodb.ObjectId(req.params.id),
    });
    if (findObjectById) {
      let deletedData = await rawData.deleteOne({
        _id: new mongodb.ObjectId(req.params.id),
      });
      return res.status(200).send({
        message: "user data deleted successfully",
        totalCount: deletedData.length || 1,
        status: [deletedData, req.body] || [],
      });
    } else {
      return res.status(404).send({
        message: "user with given ID not found",
        totalCount: findObjectById.length || 0,
        status: "invalid ID" || [],
      });
    }
  } catch (error) {
    console.log("enter valid user ID =>", error.message);
    return res.status(404).send({
      message: "enter valid user ID, user data Not Found",
      totalCount: error.length || 0,
      status: error.message || [],
    });
  }
};

module.exports = {
  userDbConnect,
  readData,
  createData,
  updateData,
  deleteData,
};
