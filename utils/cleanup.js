// utils/cleanUserData.js
const User = require("../model/User");
const Product = require("../model/Product");

const cleanUserData = async () => {
  const allProducts = await Product.find({}, "_id");
  const productIdSet = new Set(allProducts.map((p) => p._id.toString()));

  const users = await User.find();

  for (const user of users) {
    const validFavourites = user.favourites.filter((id) =>
      productIdSet.has(id.toString())
    );

    const validCart = user.cart.filter((item) =>
      productIdSet.has(item.productId?.toString())
    );

    await User.updateOne(
      { _id: user._id },
      {
        favourites: validFavourites,
        cart: validCart,
      }
    );
  }
};

module.exports = cleanUserData;
