const Product = require("../model/Product");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate("owner");
    res.status(200).json({ products });
  } catch (error) {
    console.log(error);
  }
};

exports.getProductDetails = async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id).populate("owner");
    res.status(200).json({ product });
  } catch (error) {
    console.log(error);
  }
};

exports.postPayment = async (req, res) => {
  const groupedBySeller = {};

  for (const item of products) {
    const product = await Product.findById(item.productId._id).populate(
      "owner"
    );

    if (!product || !product.owner || !product.owner.stripeAccountId) {
      return res
        .status(400)
        .json({ error: "Invalid product or seller not connected." });
    }

    const sellerId = product.owner._id.toString();
    if (!groupedBySeller[sellerId]) {
      groupedBySeller[sellerId] = {
        stripeAccountId: product.owner.stripeAccountId,
        items: [],
      };
    }

    groupedBySeller[sellerId].items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.productName,
          images: [`https://yourdomain.com${product.productImage}`],
        },
        unit_amount: product.productPrice * 100,
      },
      quantity: item.quantity,
    });
  }
};
