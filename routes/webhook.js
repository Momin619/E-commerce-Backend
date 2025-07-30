// routes/webhook.js
const express = require("express");
const router = express.Router();
const Order = require("../model/Order");
const Product = require("../model/Product");
const User = require("../model/User");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("🔔 Webhook received");
    console.log("Headers:", req.headers);
    console.log("Body type:", typeof req.body);

    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature error:", err.message);
      return res.sendStatus(400);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = session.metadata;

      try {
        const productIds = metadata.productIds.split(",");
        const quantities = metadata.quantities.split(",");
        const prices = metadata.prices.split(",");
        const names = metadata.productNames.split(",");

        const sellerId = metadata.sellerId;

        const products = await Promise.all(
          productIds.map(async (id, index) => {
            const product = await Product.findById(id);
            const quantity = parseInt(quantities[index]);

            // 🧠 Reduce product stock
            if (product.productStock >= quantity) {
              product.productStock -= quantity;
              await product.save();
            }

            return {
              product: id,
              name: names[index],
              price: parseFloat(prices[index]),
              quantity,
            };
          })
        );

        const totalAmount = products.reduce(
          (acc, p) => acc + p.price * p.quantity,
          0
        );
        const buyer = await User.findById(metadata.buyerId);
        const seller = await User.findById(metadata.sellerId);
        if (!buyer || !seller) throw new Error("Invalid buyer or seller");

        await Order.create({
          buyer: {
            id: buyer._id,
            name: `${buyer.firstName} ${buyer.lastName}`,
            email: buyer.email,
          },
          seller: {
            id: seller._id,
            name: `${seller.firstName} ${seller.lastName}`,
            email: seller.email,
          },
          products,
          totalAmount,
          paymentStatus: "paid",
        });

        res.status(200).send("Webhook processed");
      } catch (err) {
        console.error("Order creation error:", err.message);
        res.status(500).send("Error processing order");
      }
    } else {
      res.sendStatus(200); // other event types
    }
  }
);

module.exports = router;
