const Order = require("../model/Order");
const User = require("../model/User");
exports.getOrders = async (req, res, next) => {
  console.log("Order block called ");
  try {
    const userId = req.session.user._id;
    console.log(userId);

    const allOrders = await Order.find();

    const orders = allOrders.filter(
      (order) => order.seller.id.toString() === userId.toString()
    );
    res.status(200).json({ orders });
    console.log(orders);
  } catch (error) {
    console.log(error);
  }
};
