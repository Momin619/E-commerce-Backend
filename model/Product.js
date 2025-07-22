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
});

module.exports = mongoose.model("Product", ProductSchema);
