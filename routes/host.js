const Product = require("../models/product");

// POST: Add Product
exports.postAddProduct = async (req, res) => {
  try {
    const { title, price, description, location } = req.body;

    const product = new Product({
      title,
      price,
      description,
      location,
      image: req.file ? req.file.filename : null, // ✅ store only filename
      owner: req.user._id, // assuming user is added to req in auth middleware
    });

    await product.save();

    res.status(201).json({ message: "Product added successfully", product });
  } catch (err) {
    console.error("Add product failed:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET: All Products for Host
exports.getHostProducts = async (req, res) => {
  try {
    const products = await Product.find({ owner: req.user._id });
    res.status(200).json({ products });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch host products" });
  }
};

// DELETE: Product by ID
exports.postDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
};

// GET: Product Details
exports.getProductDetails = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "owner",
      "name"
    );
    res.status(200).json({ product });
  } catch (err) {
    res.status(500).json({ error: "Product not found" });
  }
};

// GET: Edit Product (Fetch)
exports.getEditProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json({ product });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

// PUT: Edit Product
exports.putEditProduct = async (req, res) => {
  try {
    const { title, price, description, location } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    product.title = title;
    product.price = price;
    product.description = description;
    product.location = location;

    if (req.file) {
      product.image = req.file.filename; // ✅ update only filename
    }

    await product.save();
    res.status(200).json({ message: "Product updated", product });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
};
