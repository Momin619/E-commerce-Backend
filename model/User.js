const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  firstName: { required: true, type: String },
  lastName: { required: true, type: String },
  email: { required: true, type: String },
  password: { required: true, type: String },
  userType: {
    type: String,
    required: true,
    enum: ["host", "user"],
    default: "user",
  },
  favourites: [
    { required: true, type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  ],
  cart: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // assuming your product model is named 'Product'
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
});

module.exports = mongoose.model("User", UserSchema);
