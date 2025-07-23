const express = require("express");

const profileRouter = express.Router();

const profileController = require("../controller/profile");

profileRouter.get("/profile", profileController.getUserProfile);

module.exports = profileRouter;
