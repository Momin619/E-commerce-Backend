// utils/cleanUserData.js
const User = require("../model/User");
const Product = require("../model/Product");

const cleanUserData = async () => {
  const users = await User.find();

  for (const user of users) {
    const validFavourites = [];
    const validCart = [];

    for (const favId of user.favourites) {
      if (await Product.exists({ _id: favId })) {
        validFavourites.push(favId);
      }
    }

    for (const item of user.cart) {
      if (await Product.exists({ _id: item.productId })) {
        validCart.push(item);
      }
    }

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
