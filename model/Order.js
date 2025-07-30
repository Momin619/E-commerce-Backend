const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  buyer: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    email: String,
  },
  seller: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    email: String,
  },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  totalAmount: Number,
  paymentStatus: { type: String, default: "paid" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
