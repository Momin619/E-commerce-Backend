const express = require("express");
const stripeRouter = express.Router();
const stripeController = require("../controller/stripe"); // your JWT middleware

stripeRouter.post(
  "/create-checkout-session",
  stripeController.createCheckoutSession
);
stripeRouter.post("/connect", stripeController.createConnectAccount);

module.exports = stripeRouter;
