const express = require("express");

const cartRouter = express.Router();

const cartController = require("../controller/cart");

cartRouter.post("/add-to-cart/cart-item/:id", cartController.postAddTocart);

cartRouter.post(
  "/decrease-cart/cart-item/:id",
  cartController.postDecreaseCartItem
);

cartRouter.post(
  "/remove-from-cart/item/:id",
  cartController.postRemoveFromCart
);

cartRouter.get("/cart", cartController.getCartItems);

module.exports = cartRouter;
