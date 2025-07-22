const User = require("../model/User");
exports.postFavouriteProduct = async (req, res, next) => {
  const userId = req.session.user._id;

  const user = await User.findById({ _id: userId });
  console.log(user);
  try {
    const homeId = req.params.id;
    // Check if the product is already in favourites
    const alreadyExists = user.favourites.some(
      (favId) => favId.toString() === homeId
    );

    if (alreadyExists) {
      return res
        .status(400)
        .json({ message: "Product already in favourites." });
    }

    // Save new favourite
    user.favourites.push(homeId);
    await user.save();

    res.status(200).json({ favourites: user.favourites });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

exports.getFavouriteProducts = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const user = await User.findById(userId).populate("favourites");
    console.log("Users favourite", user);
    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
  }
};

exports.removeFavouriteHome = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const homeId = req.params.id;

    const user = await User.findById(userId);

    user.favourites = user.favourites.filter(
      (favId) => favId.toString() !== homeId
    );

    await user.save();

    res.status(200).json({ message: "Favourite removed!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};
