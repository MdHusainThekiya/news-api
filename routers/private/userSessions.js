const tokenController = require("../../mongoControllers/tokenController");
const authentication = require("../../middlewares/authentication");
const express = require("express");
const router = express.Router();

router.get("/", authentication.verifyUser,tokenController.readData);
router.delete("/:sessionNumber", authentication.verifyUser,tokenController.deleteData);

module.exports = router