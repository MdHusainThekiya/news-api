const { Validator } = require("node-input-validator");
const userContoller = require("../mongoControllers/userContoller");

// Data Validation Middleware
const validateUserEntry = async (req, res, next) => {
  try {
    const validator = new Validator(req.body, {
      firstName: "string|required|minLength:5|maxLength:20",
      lastName: "string|required|minLength:5|maxLength:20",
      email: "required|email|minLength:8",
      password: "required|lengthBetween:6,15|same:confirm_password",
      isAdmin: "boolean",
    });

    validator.addPostRule((data) => {
      var passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
      if (!data.inputs.password.match(passw)) {
        data.error(
          "password",
          "notMatch",
          "password should contain at least one numeric digit,one uppercase and one lowercase letter"
        );
      }
    });
    validator.addPostRule((data) => {
      if (data.inputs.lastName === data.inputs.firstName) {
        data.error(
          "lastName",
          "matched",
          "lastName should be different than first name"
        );
      }
    });

    const isMatched = await validator.check();
    if (!isMatched) {
      console.log(validator.errors);
      return res.status(400).send({
        message: "invalid input data",
        totalCount: Object.keys(validator.errors).length || 0,
        status: validator.errors || [],
      });
    }
  } catch (error) {
    console.log("unable to validate the input data =>", error.message);
    if (!Object.keys(req.body).length > 0) {
      return res.status(404).send({
        message: "user input data not found, please enter the required data",
        totalCount: Object.keys(req.body).length || 0,
        status: error.message || [],
      });
    }
    return res.status(400).send({
      message: "invalid input data",
      totalCount: Object.keys(req.body).length || 0,
      status: error.message || [],
    });
  }
  next();
};


const validateEmailForSignUp = async (req, res, next) => {
  try {
    const emailValidator = new Validator(req.body, {
      email: "required|email",
    });
    emailValidator.addPostRule(async (data) => {
      const rawData = await userContoller.userDbConnect();
      const emailInDb = await rawData.findOne({ email: req.body.email });
      if (emailInDb) {
        data.error(
          "email",
          "matched",
          "this email Id is already registered with us."
        );
      }
    });
    const isMatched = await emailValidator.check();
    if (!isMatched) {
      console.log(emailValidator.errors);
      return res.status(400).send({
        message: "invalid input data",
        totalCount: Object.keys(emailValidator.errors).length || 0,
        status: emailValidator.errors || [],
      });
    }
  } catch (error) {
    console.log("unable to validate the input data =>", error.message);
    return res.status(400).send({
        message: "invalid input data",
        totalCount: Object.keys(req.body).length || 0,
        status: error.message || [],
      });
  }
  next();
};

module.exports = {
  validateUserEntry,
  validateEmailForSignUp,
};
