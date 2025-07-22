const express = require("express");

const authRouter = express.Router();

const authController = require("../controller/auth");

authRouter.post("/signup", authController.postSignUp);
authRouter.post("/login", authController.postLogin);
authRouter.post("/logout", authController.postLogout);

module.exports = authRouter;
