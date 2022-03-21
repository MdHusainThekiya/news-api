const { Validator } = require("node-input-validator");
const categoryController = require("../mongoControllers/categoryController");

const ValidateNewsCategory = async (req, res, next) => {
  try {
    const validator = new Validator(req.body, {
      title: "string|required|minLength:3|maxLength:20",
    });

    validator.addPostRule(async (data) => {
      let rawData = await categoryController.newsCatagoryDbConnect();
      let findDataByTitleInDb = await rawData.findOne({
        title: req.body.title,
      });
      if (findDataByTitleInDb) {
        data.error(
          "title",
          "Matched",
          "Given Title is already existing in news catagory, title should be unique"
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
    next();
  } catch (error) {
    console.log("unable to validate catagory =>", error.message);
    return res.status(400).send({
      message: "unable to validate catagory",
      totalCount: 0,
      status: error.message || [],
    });
  }
};

module.exports = {
  ValidateNewsCategory,
};
