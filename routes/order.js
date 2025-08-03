const express = require("express");

const orderRouter = express.Router();

const orderController = require("../controller/order");

orderRouter.get("/host/orders", orderController.getOrders);

module.exports = orderRouter;
