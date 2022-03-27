const express = require("express");
require("dotenv").config();
const userSignUp = require("./routers/userSIgnUp");
const userLogIn = require("./routers/userLogIn");
const newsCategory = require("./routers/private/newsCategory");
const newsArticle = require("./routers/private/newsArticle");
const userSessions = require("./routers/private/userSessions");
const app = express();

// Create Routers
app.use(express.json());
app.use("/signup", userSignUp);
app.use("/login", userLogIn);
app.use("/newscategory", newsCategory);
app.use("/newsarticle", newsArticle);
app.use("/usersessions", userSessions);

// Listen ROuters
const port = process.env.PORT || 4000;
app.listen(port, console.log(`Listning on port ${port}`));
