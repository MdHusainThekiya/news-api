const { Validator } = require("node-input-validator");
const articleController = require("../mongoControllers/articleController");

const validateNewsArticle = async (req, res, next) => {
  try {
    const validator = new Validator(req.body, {
      title: "string|required|minLength:5|maxLength:100",
      category: "string|required|minLength:3|maxLength:40",
      description: "string|required|minLength:20|maxLength:200",
      content: "string|required|minLength:20|maxLength:1000",
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
    console.log("unable to validate article =>", error.message);
    return res.status(400).send({
      message: "unable to validate article",
      totalCount: 0,
      status: error.message || [],
    });
  }
};

const validateTitleForNewNewsArticle = async (req, res, next) => {
  try {
    const validator = new Validator(req.body, {
      title: "string|required|minLength:5|maxLength:100",
    });
    validator.addPostRule(async (data) => {
      let rawData = await articleController.newsArticleDbConnect();
      let findDataByTitleInDb = await rawData.findOne({
        title: req.body.title,
      });
      if (findDataByTitleInDb) {
        data.error(
          "title",
          "Matched",
          "Given Title is already in existing news Articles, title should be unique"
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
    console.log("unable to validate article =>", error.message);
    return res.status(400).send({
      message: "unable to validate article",
      totalCount: 0,
      status: error.message || [],
    });
  }
};

module.exports = {
  validateNewsArticle,
  validateTitleForNewNewsArticle,
};
