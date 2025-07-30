const User = require("../model/User");
const Product = require("../model/Product");
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

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productStock = product.productStock;

    if (productStock <= 0) {
      return res.status(400).json({ message: "Product out of stock" });
    }

    const existingItem = user.cart.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      if (existingItem.quantity < productStock) {
        existingItem.quantity += 1;
        console.log("Quantity increased in cart");
      } else {
        return res
          .status(400)
          .json({ message: "Stock limit reached for this product" });
      }
    } else {
      // Add with quantity 1 or limit to stock if stock < 1
      user.cart.push({
        productId,
        quantity: 1,
      });
      console.log("New product added to cart");
    }

    await user.save();

    return res.status(200).json({
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
