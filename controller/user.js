const Product = require("../model/Product");
const stripe = require("stripe")(
  "sk_test_51RpCS0RswC8iinaz94Mtyx3mZI2rQJiKvLvIK2Ma5p9q3QbBZcNO3ekmV5umRkbmcDvYacgdmlONV3LxQCLyRcSg00iYGyjuVE"
);
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

exports.postPayment = async (req, res, next) => {
  try {
    const { products } = req.body;
    console.log(req.body);
    const lineItems = products.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.productId.productName,
          images: [
            `https://e-commerce-backend-production-abe1.up.railway.app${item.productId.productImage}`,
          ],
        },
        unit_amount: item.productId.productPrice * 100, // Stripe uses cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
    });

    res.status(200).json({ id: session.id });
  } catch (err) {
    console.error("Stripe Checkout Error:", err.message);
    res.status(500).json({ error: "Stripe Checkout Failed" });
  }
};
