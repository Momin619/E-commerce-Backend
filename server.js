require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);
const path = require("path");

const app = express();
app.set("trust proxy", 1);

// === 🔧 ENABLE CORS FIRST (NO SLASH at end) ===
app.use(
  cors({
    origin: "https://e-commerce-frontend-drab-gamma.vercel.app",
    credentials: true,
  })
);

// === 📦 MIDDLEWARES ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// === 🍪 SESSION SETUP ===
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

app.use(
  session({
    secret: "yourSecret",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "none", // required for cross-site cookies
    },
  })
);

// === 🧠 YOUR ROUTES ===
const methodUrlRouter = require("./routes/method-url");
const authRouter = require("./routes/auth");
const hostRouter = require("./routes/host");
const userRouter = require("./routes/user");
const favouriteProductRouter = require("./routes/favourite");

app.get("/me", (req, res) => {
  if (req.session.user && req.session.isLoggedIn) {
    res.json({ user: req.session.user, isLoggedIn: true });
  } else {
    res.json({ user: null, isLoggedIn: false });
  }
});

app.use(methodUrlRouter);
app.use(authRouter);
app.use(hostRouter);
app.use(userRouter);
app.use(favouriteProductRouter);

// === 🔌 DB CONNECTION ===
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    const PORT = process.env.PORT || 3000;
    console.log("MongoDB connected!");
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch((err) => console.log("Mongoose error:", err));
