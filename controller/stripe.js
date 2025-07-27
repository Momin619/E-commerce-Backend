const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Product = require("../model/Product");
const User = require("../model/User");
const isProduction = process.env.NODE_ENV === "production";

const BASE_URL = isProduction
  ? "https://e-commerce-backend-production-abe1.up.railway.app"
  : "http://localhost:3000";

const FRONTEND_URL = isProduction
  ? process.env.FRONTEND_PROD
  : process.env.FRONTEND_DEV;

exports.createCheckoutSession = async (req, res) => {
  try {
    const { products } = req.body;

    const lineItems = products.map((item) => ({
      price_data: {
        currency: "gbp",
        unit_amount: Math.round(item.productPrice * 100),
        product_data: {
          name: item.productName,
          images: [`${BASE_URL}${item.productImage}`],
        },
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${FRONTEND_URL}/stripe/success`,
      cancel_url: `${FRONTEND_URL}/stripe/failed`,

      // ✅ Send relevant metadata here (optional)
      metadata: {
        sellerId: products[0]?.ownerId?.toString() || "unknown",
        productIds: products.map((p) => p.productId.toString()).join(","),
        productNames: products.map((p) => p.productName).join(","),
        quantities: products.map((p) => p.quantity.toString()).join(","),
        prices: products.map((p) => p.productPrice.toString()).join(","),
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

exports.createConnectAccount = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);

    // Check if the user already has a Stripe account
    let account;
    if (!user.stripeAccountId) {
      // If not, create a new one
      account = await stripe.accounts.create({ type: "express" });
      user.stripeAccountId = account.id;
      await user.save();
    } else {
      try {
        // Try retrieving the existing account to verify it still exists
        account = await stripe.accounts.retrieve(user.stripeAccountId);
      } catch (err) {
        // If account doesn't exist (deleted), reset and recreate
        account = await stripe.accounts.create({ type: "express" });
        user.stripeAccountId = account.id;
        await user.save();
      }
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: user.stripeAccountId,
      refresh_url: ` ${FRONTEND_URL}`,
      return_url: `${FRONTEND_URL}`,
      type: "account_onboarding",
    });

    res.json({ url: accountLink.url });
  } catch (err) {
    console.error("Stripe Connect Error:", err.message);
    res.status(500).json({ error: "Stripe connection failed" });
  }
};
