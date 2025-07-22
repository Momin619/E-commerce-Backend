const express = require("express");

const userRouter = express.Router();

const userController = require("../controller/user");

userRouter.get("/products", userController.getProducts);
userRouter.get("/product-detail/product/:id", userController.getProductDetails);

module.exports = userRouter;
