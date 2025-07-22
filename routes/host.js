const express = require("express");

const hostRouter = express.Router();

const productController = require("../controller/host");

const upload = require("../multer/multer");

hostRouter.post(
  "/host/add-product",
  upload.single("image"),
  productController.postAddProduct
);

hostRouter.get("/host/products", productController.getHostProducts);

hostRouter.delete(
  "/host/delete-product/:id",
  productController.postDeleteProduct
);

hostRouter.get(
  "/product-details/product/:id",
  productController.getProductDetails
);

hostRouter.get(
  "/host/edit-product/product/:id",
  productController.getEditProduct
);
hostRouter.put(
  "/host/edit-product/product/:id",
  upload.single("image"),
  productController.putEditProduct
);

module.exports = hostRouter;
