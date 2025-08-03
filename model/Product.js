const express = require("express");
const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema({
  productName: { required: true, type: String },
  productDescription: { required: true, type: String },
  productPrice: { required: true, type: Number },
  productImage: { required: true, type: String },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productStock: {
    required: true,
    type: Number,
    min: 0,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  productCategory: {
    type: String,
    required: true,
    enum: ["Electronics", "Clothing", "Food", "Accessories", "Other"],
  },
});

// Delete product references from User & Orders before deletion
ProductSchema.pre("findOneAndDelete", async function (next) {
  const product = await this.model.findOne(this.getQuery());

  if (product) {
    const productId = product._id;

    // 1. Remove from User favourites and cart
    await mongoose.model("User").updateMany(
      {
        $or: [{ favourites: productId }, { "cart.productId": productId }],
      },
      {
        $pull: {
          favourites: productId,
          cart: { productId: productId },
        },
      }
    );

    // 2. Delete orders that contain this product
    await mongoose.model("Order").deleteMany({
      "products.productId": productId,
    });
  }

  next();
});

// Update inStock based on productStock
ProductSchema.pre("save", function (next) {
  this.inStock = this.productStock > 0;
  next();
});

module.exports = mongoose.model("Product", ProductSchema);
