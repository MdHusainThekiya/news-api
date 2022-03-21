const mongoClient = require("../mongoClient");
const userContoller = require("./userContoller");
const mongodb = require('mongodb');
const categoryController = require("./categoryController");
const jsonwebtoken = require("jsonwebtoken");
const databaseName = process.env.DATABASE_NAME || "NewsAPI";
const collectionName = "newsArticleDb";

// create userDb collection
async function newsArticleDbConnect() {
  try {
    let connecting = await mongoClient.client.connect();
    return connecting.db(databaseName).collection(collectionName);
  } catch (error) {
    console.log(
      "failed to connect with newsArticle database =>",
      error.message
    );
    return res.status(400).send({
      message: "failed to connect with newsArticle database",
      totalCount: 0,
      status: error.message || [],
    });
  }
}

// READ newsArticle Data
const readData = async (req, res) => {
  try {
    let rawData = await newsArticleDbConnect();
    let processedData = await rawData.find().toArray();

    if (processedData && Object.keys(processedData).length > 0) {
      console.log("newsArticle data =>", processedData);
      return res.status(200).send({
        message: "newsArticle data fetch successfully",
        totalCount: processedData.length || 0,
        status: processedData || [],
      });
    } else {
      console.log(processedData);
      return res.status(404).send({
        message: "newsArticle data not found",
        totalCount: processedData.length || 0,
        status: [processedData, "zero entries in user database"] || [],
      });
    }
  } catch (error) {
    console.log("unable to get newsArticle data =>", error.message);
    return res.status(404).send({
      message: "newsArticle data Not Found",
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
    let categoryRawData = await categoryController.newsCatagoryDbConnect();
    let findCategoryByTitleInDb = await categoryRawData.findOne({
      title: req.body.category,
    });
    if (!findCategoryByTitleInDb) {
      console.log("Category Not Found, Pl enter Valid Category");
      return res.status(404).send({
        message: "Category Not Found, Pl enter Valid Category",
        totalCount: 0,
        status: 'enter valid "category"' || [],
      });
    }
    let rawData = await newsArticleDbConnect();
    let processedData = await rawData.insertOne({
      author: [
        findUserDataByEmailInDb.firstName,
        findUserDataByEmailInDb.lastName,
      ].join(" "),
      title: req.body.title,
      category: findCategoryByTitleInDb,
      description: req.body.description,
      content: req.body.content,
      publishedAt: new Date().toISOString(),
      updatedBy: [
        findUserDataByEmailInDb.firstName,
        findUserDataByEmailInDb.lastName,
      ].join(" "),
      updatedAt: new Date().toISOString(),
    });
    console.log("successfully created newsArticle =>", processedData);
    return res.status(201).send({
      message: "newsArticle created successfully",
      totalCount: 1,
      status:
        [processedData, await rawData.findOne({ title: req.body.title })] || [],
    });
  } catch (error) {
    console.log("unable to post/create newsArticle =>", error.message);
    return res.status(404).send({
      message: "unable to post/create newsArticle",
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
    let categoryRawData = await categoryController.newsCatagoryDbConnect();
    let findCategoryByTitleInDb = await categoryRawData.findOne({
      title: req.body.category,
    });
    if (!findCategoryByTitleInDb) {
      console.log("Category Not Found, Pl enter Valid Category");
      return res.status(404).send({
        message: "Category Not Found, Pl enter Valid Category",
        totalCount: 0,
        status: 'enter valid "category"' || [],
      });
    }
    let rawData = await newsArticleDbConnect();
    let processedData = await rawData.updateOne(
      { _id: new mongodb.ObjectId(req.params.id) },
      {
        $set: {
          title: req.body.title,
          category: findCategoryByTitleInDb,
          description: req.body.description,
          content: req.body.content,
          updatedBy: [
            findUserDataByEmailInDb.firstName,
            findUserDataByEmailInDb.lastName,
          ].join(" "),
          updatedAt: new Date().toISOString(),
        },
      }
    );
    console.log("successfully updated newsArticle =>", processedData);
    return res.status(201).send({
      message: "newsArticle updated successfully",
      totalCount: 1,
      status:
        [processedData, await rawData.findOne({ title: req.body.title })] || [],
    });
  } catch (error) {
    console.log("unable to put/update newsArticle =>", error.message);
    return res.status(404).send({
      message: "unable to put/update newsArticle",
      totalCount: error.length || 0,
      status: error.message || [],
    });
  }
};


// DELETE DATA
const deleteData = async (req, res) => {
  try {
    let rawData = await newsArticleDbConnect()
    let findObjectById = await rawData.findOne({
      _id: new mongodb.ObjectId(req.params.id),
    });
    if (findObjectById) {
      let deletedData = await rawData.deleteOne({
        _id: new mongodb.ObjectId(req.params.id),
      });
      console.log("newsArticle deleted successfully =>", deletedData);
      return res.status(200).send({
        message: "newsArticle deleted successfully",
        totalCount: deletedData.length || 1,
        status: [deletedData, findObjectById] || [],
      });
    } else {
      console.log("newsArticle with given ID not found");
      return res.status(404).send({
        message: "newsArticle with given ID not found",
        totalCount: findObjectById.length || 0,
        status: "invalid ID" || [],
      });
    }
  } catch (error) {
    console.log("enter valid newsArticle ID =>", error.message);
    return res.status(404).send({
      message: "enter valid newsArticle ID, Catagory Not Found",
      totalCount: 1,
      status: error.message || [],
    });
  }
};


module.exports = {
  newsArticleDbConnect,
  readData,
  createData,
  updateData,
  deleteData
};
