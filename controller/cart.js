const User = require("../model/User");

const calculateTotal = (cart) => {
  return Object.values(cart).reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
};

exports.postAddTocart = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const productId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if product is already in the cart
    const existingItem = user.cart.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      // If found, increase quantity
      existingItem.quantity += 1;
    } else {
      // Else push new item to cart
      user.cart.push({
        productId,
        quantity: 1,
      });
    }

    await user.save();

    res.status(200).json({
      message: "Product added to cart",
      cart: user.cart,
    });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.postDecreaseCartItem = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const productId = req.params.id;

    const user = await User.findById(userId);
    const item = user.cart.find(
      (item) => item.productId.toString() === productId
    );

    if (!item)
      return res.status(404).json({ message: "Item not found in cart" });

    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      user.cart = user.cart.filter(
        (item) => item.productId.toString() !== productId
      );
    }

    await user.save();
    res.status(200).json({ message: "Item decreased", cart: user.cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error decreasing cart item" });
  }
};

exports.postRemoveFromCart = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const productId = req.params.id;

    const user = await User.findById(userId);
    user.cart = user.cart.filter(
      (item) => item.productId.toString() !== productId
    );

    await user.save();
    res
      .status(200)
      .json({ message: "Item removed from cart", cart: user.cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error removing from cart" });
  }
};

exports.getCartItems = async (req, res, next) => {
  try {
    const userId = req.session.user._id;

    const user = await User.findById(userId).populate("cart.productId");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // const user = user.populate('cart');
    res.status(200).json({ cartItems: user.cart });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Something went wrong while fetching cart items" });
  }
};
