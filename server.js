require("dotenv").config();

const express = require("express");

const app = express();
app.use(express.urlencoded({ extended: true }));

const cors = require("cors");

const mongoose = require("mongoose");

const port = process.env.PORT;

const mongo_uri = process.env.MONGO_URI;

const session = require("express-session");

const mongodb_session = require("connect-mongodb-session")(session);

const store = mongodb_session({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

app.use(
  session({
    secret: "my mern website",
    saveUninitialized: false,
    resave: false,
    store,
  })
);

// local modules

const methodUrlRouter = require("./routes/method-url");

const authRouter = require("./routes/auth");

const hostRouter = require("./routes/host");

const userRouter = require("./routes/user");

const favouriteProductRouter = require("./routes/favourite");

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

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
    console.log("Mongo db connected !");
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((error) => console.log(error));
