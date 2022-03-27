const { raw } = require("express");
const mongoClient = require("../mongoClient");
const userContoller = require("./userContoller");
const jsonwebtoken = require("jsonwebtoken");
const databaseName = process.env.DATABASE_NAME || "NewsAPI";
const collectionName = "tokenDb";

// create tokenDb collection
async function tokenDbConnect() {
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

// INSERT TOKEN IN DATABASE
const insertToken = async (token, decode) => {
  let userRawData = await userContoller.userDbConnect();
  let findUserDataByEmailInDb = await userRawData.findOne({
    email: decode.email,
  });
  let tokenRawData = await tokenDbConnect();
  let findTokenDataByUserIdInTokenDb = await tokenRawData.findOne({
    userId: findUserDataByEmailInDb._id,
  });
  try {
    if (!findTokenDataByUserIdInTokenDb) {
      let rawData = await tokenDbConnect();
      let processedData = await rawData.insertOne({
        userId: findUserDataByEmailInDb._id,
        userInfo: {
          userName: [
            findUserDataByEmailInDb.firstName,
            findUserDataByEmailInDb.lastName,
          ].join(" "),
          userEmail: findUserDataByEmailInDb.email,
        },
        userActiveSessions: [
          {
            sessionNumber: 1,
            sessionToken: token,
          },
        ],
      });
      return console.log(
        "successfully inserted New User with token =>",
        processedData
      );
    } else {
      let rawData = await tokenDbConnect();
      let tokenArray = [];
      let sessionNumber = 1;
      for (let tokenDataInArray of findTokenDataByUserIdInTokenDb.userActiveSessions) {
        tokenArray.push({
          sessionNumber: sessionNumber,
          sessionToken: tokenDataInArray.sessionToken,
        });
        sessionNumber = sessionNumber + 1;
      }
      tokenArray.push({
        sessionNumber: tokenArray.length + 1,
        sessionToken: token,
      });
      let processedData = await rawData.update(
        {
          _id: findTokenDataByUserIdInTokenDb._id,
        },
        {
          $set: {
            userActiveSessions: tokenArray,
          },
        }
      );
      return console.log(
        "successfully updated New token of existing user =>",
        processedData
      );
    }
  } catch (error) {
    return console.log("unable to insert token =>", error);
  }
};

// Read Tokens || Get users Active sessions
const readData = async (req, res) => {
  try {
    const token = req.header("token");
    const decode = jsonwebtoken.verify(token, process.env.JWT_SECRET_KEY);
    let userRawData = await userContoller.userDbConnect();
    let findUserDataByEmailInDb = await userRawData.findOne({
      email: decode.email,
    });
    let rawData = await tokenDbConnect();
    let processedData = await rawData.findOne({
      userId: findUserDataByEmailInDb._id,
    });
    if (processedData && Object.keys(processedData).length > 0) {
      console.log("User Active Sessions =>", processedData);
      return res.status(200).send({
        message: "User Active Sessions fetch successfully",
        totalCount: processedData.length || 0,
        status: processedData || [],
      });
    } else {
      console.log(processedData);
      return res.status(404).send({
        message: "User Active Sessions not found",
        totalCount: processedData.length || 0,
        status: [processedData, "zero entries in userToken database"] || [],
      });
    }
  } catch (error) {
    console.log("unable to get user Token data =>", error.message);
    return res.status(404).send({
      message: "User Active Sessions not found",
      totalCount: error.length || 0,
      status: error.message || [],
    });
  }
};

// Delete users active session one by one
const deleteData = async (req, res) => {
  try {
    const token = req.header("token");
    const decode = jsonwebtoken.verify(token, process.env.JWT_SECRET_KEY);
    let userRawData = await userContoller.userDbConnect();
    let findUserDataByEmailInDb = await userRawData.findOne({
      email: decode.email,
    });
    let rawData = await tokenDbConnect();
    let processedData = await rawData.findOne({
      "userActiveSessions.sessionNumber": Number(req.params.sessionNumber),
    });

    if (processedData) {
      let deletedData = await rawData.update(
        {},
        {
          $pull: {
            userActiveSessions: {
              sessionNumber: Number(req.params.sessionNumber),
            },
          },
        }
      );

      // below code for session number reset after delete
      let findRawData = await tokenDbConnect();
      let findTokenDataByUserIdInTokenDb = await findRawData.findOne({
        userId: findUserDataByEmailInDb._id,
      });
      let tokenArray = [];
      let sessionNumber = 1;
      for (let tokenDataInArray of findTokenDataByUserIdInTokenDb.userActiveSessions) {
        tokenArray.push({
          sessionNumber: sessionNumber,
          sessionToken: tokenDataInArray.sessionToken,
        });
        sessionNumber = sessionNumber + 1;
      }
     
      let resetRawData = await tokenDbConnect();
      let resetProcessedData = await resetRawData.update(
        {
          _id: findTokenDataByUserIdInTokenDb._id,
        },
        {
          $set: {
            userActiveSessions: tokenArray,
          },
        }
      );

      console.log("userActiveSession deleted successfully =>", deletedData);
      console.log("session number reset successfull =>", resetProcessedData);
      return res.status(200).send({
        message: "userActiveSession deleted successfully",
        totalCount: deletedData.length || 1,
        status: [deletedData] || [],
      });
    } else {
      console.log("enter valid sessionNumber =>", error.message);
      return res.status(404).send({
        message: "enter valid sessionNumber",
        totalCount: 1,
        status: error.message || [],
      });
    }
  } catch (error) {
    console.log("enter valid sessionNumber =>", error.message);
    return res.status(404).send({
      message: "enter valid sessionNumber",
      totalCount: 1,
      status: error.message || [],
    });
  }
};



const autoDeleteToken = async (token, decode) => {
  let userRawData = await userContoller.userDbConnect();
  let findUserDataByEmailInDb = await userRawData.findOne({
    email: decode.email,
  });
  let expiryTime = Number(Number(decode.exp - decode.iat)*1000)
  let tokenRawData = await tokenDbConnect();
  let findTokenDataByUserIdInTokenDb = await tokenRawData.findOne({
    userId: findUserDataByEmailInDb._id,
  });
  try{
    setTimeout(async ()=>{
      try{
      let userRawData = await userContoller.userDbConnect();
      let findUserDataByEmailInDb = await userRawData.findOne({
        email: decode.email,
      });
      let rawData = await tokenDbConnect();
      let processedData = await rawData.findOne({
        "userActiveSessions.sessionToken": token,
      });
  
      if (processedData) {
        let deletedData = await rawData.update(
          {},
          {
            $pull: {
              userActiveSessions: {
                sessionToken: token,
              },
            },
          }
        );
  
        // below code for session number reset after delete
        let findRawData = await tokenDbConnect();
        let findTokenDataByUserIdInTokenDb = await findRawData.findOne({
          userId: findUserDataByEmailInDb._id,
        });
        let tokenArray = [];
        let sessionNumber = 1;
        for (let tokenDataInArray of findTokenDataByUserIdInTokenDb.userActiveSessions) {
          tokenArray.push({
            sessionNumber: sessionNumber,
            sessionToken: tokenDataInArray.sessionToken,
          });
          sessionNumber = sessionNumber + 1;
        }
       
        let resetRawData = await tokenDbConnect();
        let resetProcessedData = await resetRawData.update(
          {
            _id: findTokenDataByUserIdInTokenDb._id,
          },
          {
            $set: {
              userActiveSessions: tokenArray,
            },
          }
        );
          return console.log("userActiveSession expired successfully =>", [deletedData, resetProcessedData]);
      } else {
        return console.log("this is not valid session =>", error.message);
      }
    } catch (error) {
      return console.log("enter valid sessionNumber =>", error.message);
    }



      


    }, expiryTime)

  } catch(error){
    console.log('error', error);
  }
}



module.exports = {
  tokenDbConnect,
  insertToken,
  readData,
  deleteData,
  autoDeleteToken
};
