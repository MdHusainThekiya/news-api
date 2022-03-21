const mongoClient = require("../mongoClient");
const jsonwebtoken = require("jsonwebtoken");
const userContoller = require("./userContoller");
const mongodb = require("mongodb");
const databaseName = process.env.DATABASE_NAME || "NewsAPI";
const collectionName = "newsCategoryDb";

// create userDb collection
async function newsCatagoryDbConnect() {
  try {
    let connecting = await mongoClient.client.connect();
    return connecting.db(databaseName).collection(collectionName);
  } catch (error) {
    console.log(
      "failed to connect with newsCategory database =>",
      error.message
    );
    return res.status(400).send({
      message: "failed to connect with newsCategory database",
      totalCount: 0,
      status: error.message || [],
    });
  }
}

// READ newsCatagory Data
const readData = async (req, res) => {
  try {
    let rawData = await newsCatagoryDbConnect();
    let processedData = await rawData.find().toArray();

    if (processedData && Object.keys(processedData).length > 0) {
      console.log("newsCatagory data =>", processedData);
      return res.status(200).send({
        message: "newsCatagory data fetch successfully",
        totalCount: processedData.length || 0,
        status: processedData || [],
      });
    } else {
      console.log(processedData);
      return res.status(404).send({
        message: "newsCatagory data not found",
        totalCount: processedData.length || 0,
        status: [processedData, "zero entries in user database"] || [],
      });
    }
  } catch (error) {
    console.log("unable to get newsCatagory data =>", error.message);
    return res.status(404).send({
      message: "newsCatagory data Not Found",
      totalCount: error.length || 0,
      status: error.message || [],
    });
  }
};

// Create newsCatagory // NOTE: for createData, inputs are seperately validated in middleware.
const createData = async (req, res) => {
  try {
    const token = req.header("token");
    const decode = jsonwebtoken.verify(token, process.env.JWT_SECRET_KEY);
    let userRawData = await userContoller.userDbConnect();
    let findUserDataByEmailInDb = await userRawData.findOne({
      email: decode.email,
    });

    let rawData = await newsCatagoryDbConnect();
    let processedData = await rawData.insertOne({
      title: req.body.title,
      createdBy: [
        findUserDataByEmailInDb.firstName,
        findUserDataByEmailInDb.lastName,
      ].join(" "),
      updatedBy: [
        findUserDataByEmailInDb.firstName,
        findUserDataByEmailInDb.lastName,
      ].join(" "),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log("successfully created newsCatagory =>", processedData);
    return res.status(201).send({
      message: "newsCatagory created successfully",
      totalCount: 1,
      status:
        [processedData, await rawData.findOne({ title: req.body.title })] || [],
    });
  } catch (error) {
    console.log("unable to post/create newsCatagory =>", error.message);
    return res.status(404).send({
      message: "unable to post/create newsCatagory",
      totalCount: error.length || 0,
      status: error.message || [],
    });
  }
};

// UPDATE DATA
const updateData = async (req, res) => {
  try {
    const token = req.header("token");
    const decode = jsonwebtoken.verify(token, process.env.JWT_SECRET_KEY);
    let userRawData = await userContoller.userDbConnect();
    let findUserDataByEmailInDb = await userRawData.findOne({
      email: decode.email,
    });

    let rawData = await newsCatagoryDbConnect();
    let processedData = await rawData.updateOne(
      { _id: new mongodb.ObjectId(req.params.id) },
      {
        $set: {
          title: req.body.title,
          updatedBy: [
            findUserDataByEmailInDb.firstName,
            findUserDataByEmailInDb.lastName,
          ].join(" "),
          updatedAt: new Date().toISOString(),
        },
      }
    );
    console.log("successfully updated newsCatagory =>", processedData);
    return res.status(201).send({
      message: "newsCatagory updated successfully",
      totalCount: 1,
      status:
        [
          processedData,
          await rawData.findOne({ _id: new mongodb.ObjectId(req.params.id) }),
        ] || [],
    });
  } catch (error) {
    console.log("unable to put/update newsCatagory =>", error.message);
    return res.status(404).send({
      message: "unable to put/update newsCatagory",
      totalCount: error.length || 0,
      status: error.message || [],
    });
  }
};

// DELETE DATA
const deleteData = async (req, res) => {
  try {
    let rawData = await newsCatagoryDbConnect();
    let findObjectById = await rawData.findOne({
      _id: new mongodb.ObjectId(req.params.id),
    });
    if (findObjectById) {
      let deletedData = await rawData.deleteOne({
        _id: new mongodb.ObjectId(req.params.id),
      });
      console.log("newsCatagory deleted successfully =>", deletedData);
      return res.status(200).send({
        message: "newsCatagory deleted successfully",
        totalCount: deletedData.length || 1,
        status: [deletedData, findObjectById] || [],
      });
    } else {
      console.log("newsCatagory with given ID not found");
      return res.status(404).send({
        message: "newsCatagory with given ID not found",
        totalCount: findObjectById.length || 0,
        status: "invalid ID" || [],
      });
    }
  } catch (error) {
    console.log("enter valid newsCatagory ID =>", error.message);
    return res.status(404).send({
      message: "enter valid newsCatagory ID, Catagory Not Found",
      totalCount: 1,
      status: error.message || [],
    });
  }
};

module.exports = {
  newsCatagoryDbConnect,
  readData,
  createData,
  updateData,
  deleteData,
};
