const express = require("express");

const methodUrlRouter = express.Router();

methodUrlRouter.use((req, res, next) => {
  console.log("Method : ", req.method);
  console.log("URL : ", req.url);
  next();
});

module.exports = methodUrlRouter;
