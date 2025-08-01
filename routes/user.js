const express = require("express");

const userRouter = express.Router();

const userController = require("../controller/user");

userRouter.get("/products", userController.getProducts);
userRouter.get("/product-detail/product/:id", userController.getProductDetails);
userRouter.get("/home", userController.getHomePage);
userRouter.get("/home/category", userController.getCategoryProducts);
module.exports = userRouter;
