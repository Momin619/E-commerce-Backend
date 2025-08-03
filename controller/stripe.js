const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Product = require("../model/Product");
const User = require("../model/User");

const isProduction = process.env.NODE_ENV === "production";

const FRONTEND_URL = isProduction
  ? process.env.FRONTEND_PROD
  : process.env.FRONTEND_DEV;

const BASE_URL = isProduction
  ? process.env.BACKEND_PROD
  : process.env.BACKEND_DEV;

// Create Stripe Checkout Session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { products } = req.body;

    // Fetch product details
    const fetchedProducts = await Product.find({
      _id: { $in: products.map((p) => p.productId) },
    }).populate("owner");

    if (!fetchedProducts.length) {
      return res.status(400).json({ error: "No products found" });
    }

    const buyer = req.session.user;
    const firstProduct = fetchedProducts[0];

    // Create Stripe line items
    const line_items = fetchedProducts.map((product) => {
      const matched = products.find(
        (p) => p.productId === product._id.toString()
      );

      return {
        price_data: {
          currency: "gbp",
          unit_amount: Math.round(product.productPrice * 100),
          product_data: {
            name: product.productName,
            description: product.productDescription,
            images: [`${BASE_URL}${product.productImage}`], // ✅ Stripe will show this image
          },
        },
        quantity: matched?.quantity || 1,
      };
    });

    // Metadata arrays
    const metadata = {
      buyerId: buyer._id?.toString(),
      sellerId: firstProduct.owner._id?.toString(),
      productIds: fetchedProducts.map((p) => p._id.toString()).join(","),
      quantities: products.map((p) => p.quantity).join(","),
      prices: fetchedProducts.map((p) => p.productPrice).join(","),
      productNames: fetchedProducts.map((p) => p.productName).join(","),
      productImages: fetchedProducts
        .map((p) => `${BASE_URL}${p.productImage}`)
        .join(","), // ✅ added
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${FRONTEND_URL}/stripe/success`,
      cancel_url: `${FRONTEND_URL}/stripe/cancel`,
      metadata,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Checkout Session Error:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

// Create or retrieve Stripe Connect account and generate onboarding link
exports.createConnectAccount = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);

    let account;

    if (!user.stripeAccountId) {
      account = await stripe.accounts.create({ type: "express" });
      user.stripeAccountId = account.id;
      await user.save();
    } else {
      try {
        account = await stripe.accounts.retrieve(user.stripeAccountId);
      } catch (err) {
        account = await stripe.accounts.create({ type: "express" });
        user.stripeAccountId = account.id;
        await user.save();
      }
    }

    const accountLink = await stripe.accountLinks.create({
      account: user.stripeAccountId,
      refresh_url: `${FRONTEND_URL}`,
      return_url: `${FRONTEND_URL}`,
      type: "account_onboarding",
    });

    res.json({ url: accountLink.url });
  } catch (err) {
    console.error("Stripe Connect Error:", err.message);
    res.status(500).json({ error: "Stripe connection failed" });
  }
};
