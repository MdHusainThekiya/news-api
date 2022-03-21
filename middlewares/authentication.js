const jsonwebtoken = require("jsonwebtoken");
const userContoller = require("../mongoControllers/userContoller");
let userDataFromJwtDecode = null;
const verifyUser = async (req, res, next) => {
  const token = req.header("token");
  if (!token) {
    console.log("Access Denied, no token provided !!");
    return res.status(404).send({
      message: "Token NOt Found || No Token Provided",
      totalCount: 0,
      status: [],
    });
  }
  try {
    const decode = jsonwebtoken.verify(token, process.env.JWT_SECRET_KEY);
    console.log("authentication successful of USER =>", decode.email);
    userDataFromJwtDecode = decode;
    next();
  } catch (error) {
    console.log("Token Invalid OR Expired, unable to verify");
    return res.status(404).send({
      message: "Pl provide Valid Token",
      totalCount: 0,
      status: error.message || [],
    });
  }
};

const verifyAdmin = async (req, res, next) => {
  try {
      let rawData = await userContoller.userDbConnect();
      let getUserDataByEmail = await rawData.findOne({
        email: userDataFromJwtDecode.email,
      });
      if (getUserDataByEmail.isAdmin === true && verifyUser) {
        next();
      } else {
        console.log(
          `User => ${getUserDataByEmail.firstName} <= is not Admin, Access Denied`
        );
        return res.status(400).send({
          message: `User => ${getUserDataByEmail.firstName} <= is not Admin, Access Denied`,
          totalCount: 0,
          status: [],
        });
      }
    } catch (error) {
      console.log("Admin Verification failed", error);
      return res.status(404).send({
        message: "Admin Verification failed",
        totalCount: 0,
        status: error.message || [],
      });
    }
};

module.exports = {
  verifyUser,
  verifyAdmin,
};