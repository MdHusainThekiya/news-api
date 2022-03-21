const categoryController = require("../../mongoControllers/categoryController");
const categoryValidation = require("../../middlewares/categoryValidation");
const authentication = require("../../middlewares/authentication");
const express = require("express");
const router = express.Router();

// get news category
router.get("/", authentication.verifyUser, categoryController.readData);

// create news category
router.post(
  "/",
  [
    authentication.verifyUser,
    authentication.verifyAdmin,
    categoryValidation.ValidateNewsCategory,
  ],
  categoryController.createData
);

// update news category
router.put(
  "/:id",
  [
    authentication.verifyUser,
    authentication.verifyAdmin,
    categoryValidation.ValidateNewsCategory,
  ],
  categoryController.updateData
);

// delete news category
router.delete(
  "/:id",
  [authentication.verifyUser, authentication.verifyAdmin],
  categoryController.deleteData
);

module.exports = router;
