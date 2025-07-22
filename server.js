require("dotenv").config();

const express = require("express");

const app = express();
app.use(express.urlencoded({ extended: true }));

const cors = require("cors");

const mongoose = require("mongoose");

const mongo_uri = process.env.MONGO_URI;

const session = require("express-session");

const mongodb_session = require("connect-mongodb-session")(session);

const store = mongodb_session({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});
app.set("trust proxy", 1); // if behind a proxy like Railway or Vercel

app.use(
  session({
    secret: "yourSecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // ⬅️ Required for HTTPS
      sameSite: "none", // ⬅️ Required for cross-site cookies
    },
  })
);

// local modules

const methodUrlRouter = require("./routes/method-url");

const authRouter = require("./routes/auth");

const hostRouter = require("./routes/host");

const userRouter = require("./routes/user");

const favouriteProductRouter = require("./routes/favourite");

app.use(
  cors({
    origin:
      "https://e-commerce-frontend-drab-gamma.vercel.app/" ||
      "http://localhost:5173",
    credentials: true,
  })
);

const path = require("path");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());

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

// In your Express backend (e.g., routes/auth.js)

mongoose
  .connect(mongo_uri)
  .then(() => {
    const PORT = process.env.PORT || 3000;
    console.log("Mongo db connected !");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.log("Mongoose error:", error));
