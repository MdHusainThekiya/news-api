const userController = require("../mongoControllers/userContoller");
const userValidation = require("../middlewares/userValidation");
const authentication = require("../middlewares/authentication");
const express = require("express");
const router = express.Router();

router.get("/", [authentication.verifyUser, authentication.verifyAdmin], userController.readData);

// first validated the data, then create the data
router.post(
  "/",
  [userValidation.validateUserEntry, userValidation.validateEmailForSignUp],
  userController.createData
);

// first validate the data, then update the data
router.put("/:id", [userValidation.validateUserEntry, authentication.verifyUser], userController.updateData);

router.delete('/:id', [authentication.verifyUser], userController.deleteData)

module.exports = router;