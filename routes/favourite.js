const express = require("express");

const favouriteProductRouter = express.Router();

const favouriteController = require("../controller/favourite");

favouriteProductRouter.post(
  "/favourite-product/product/:id",
  favouriteController.postFavouriteProduct
);

favouriteProductRouter.get(
  "/favourites",
  favouriteController.getFavouriteProducts
);

favouriteProductRouter.delete(
  "/remove-favourite/favourite/:id",
  favouriteController.removeFavouriteHome
);

module.exports = favouriteProductRouter;
