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
  productCategory: {
    type: String,
    required: true,
    enum: ["Electronics", "Clothing", "Food", "Accessories", "Other"],
  },
});

ProductSchema.pre("findOneAndDelete", async function (next) {
  const product = await this.model.findOne(this.getQuery());
  if (product) {
    const productId = product._id;

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
  }
  next();
});

module.exports = mongoose.model("Product", ProductSchema);
