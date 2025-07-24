const calculateTotal = (cart) => {
  return Object.values(cart).reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
};

exports.postAddTocart = (req, res, next) => {
  try {
    const productId = req.params.id;
    const { name, price, image } = req.body;
    const cart = req.session.cart || {};
    if (cart[productId]) {
      cart[productId].quantity += 1;
    } else {
      cart[productId] = {
        name,
        price,
        quantity: 1,
        image,
      };
    }
    req.session.cart = cart;
    res.status(200).json({
      sucess: true,
      cart,
      total: calculateTotal(cart),
    });
  } catch (error) {}
};

exports.postDecreaseCartItem = (req, res, next) => {
  const productId = req.params.id;
  const cart = req.session.cart || {};
  if (cart[productId]) {
    cart[productId].quantity -= 1;
    if (cart[productId].quantity <= 0) {
      delete cart[productId];
    }
  }

  req.session.cart = cart;
  res.json({ success: true, cart, total: calculateTotal(cart) });
};

exports.postRemoveFromCart = (req, res, next) => {
  const productId = req.params.id;
  console.log(productId);
  const cart = req.session.cart || {};

  if (cart[productId]) {
    delete cart[productId];
    req.session.cart = cart;
    return res.json({ success: true, cart, total: calculateTotal(cart) });
  }

  return res
    .status(404)
    .json({ success: false, message: "Product not found in cart" });
};

exports.getCartItems = (req, res, next) => {
  const cart = req.session.cart || {};
  res.json({ cart, total: calculateTotal(cart) });
};
