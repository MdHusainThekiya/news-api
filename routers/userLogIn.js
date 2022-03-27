const { raw } = require("express");
const express = require("express");
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const tokenController = require('../mongoControllers/tokenController');
const userContoller = require("../mongoControllers/userContoller");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    let rawData = await userContoller.userDbConnect();
    let userByEmailInDb = await rawData.findOne({ email: req.body.email }); // note email is uniquely validated
    const validatePassword = await bcrypt.compare(
      req.body.password,
      userByEmailInDb.password
    );
    if (userByEmailInDb.email === req.body.email && validatePassword) {
      const token = jsonwebtoken.sign(
        { email: req.body.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: 60 * 10 } // token validity of 600seconds or 10mins
      );
      const decode = jsonwebtoken.verify(token, process.env.JWT_SECRET_KEY);
      console.log("Successfully Logged In", "\n", token);
      console.log(decode);
      
      tokenController.insertToken(token, decode);
      tokenController.autoDeleteToken(token, decode);
      
      res.status(200).send({
        message: "Login successful",
        totalCount: Object.keys([userByEmailInDb, token]).length || 0,
        status: [userByEmailInDb, token] || [],
      });
    } else {
      console.log("Invalid User Credentials");
      return res.status(400).send({
        message: "Invalid User Credentials",
        totalCount: 0,
        status: [],
      });
    }
  } catch (error) {
    console.log("User LogIn Failed =>", error);
    return res.status(400).send({
      message: "User LogIn Failed",
      totalCount: 0,
      status: error.message || [],
    });
  }
});

module.exports = router;
