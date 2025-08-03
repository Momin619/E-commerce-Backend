const Product = require("../model/Product");
const User = require("../model/User");
const fs = require("fs");
const path = require("path");
const cleanUserData = require("../utils/cleanup");
// Add Product
const VALID_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Food",
  "Accessories",
  "Other",
];
exports.postAddProduct = async (req, res, next) => {
  try {
    const {
      productName,
      productDescription,
      productPrice,
      productStock,
      productCategory,
    } = req.body;

    const owner = req.session.user._id;

    // Validate category
    if (!VALID_CATEGORIES.includes(productCategory)) {
      return res.status(400).json({ error: "Invalid product category." });
    }

    // Check image
    if (!req.file) {
      return res.status(400).json({ error: "Image upload required." });
    }

    const product = new Product({
      productName,
      productDescription,
      productPrice,
      productStock,
      productImage: "/uploads/" + req.file.filename,
      owner,
      productCategory,
    });

    await product.save();

    res.status(201).json({ message: "Product added", product });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Adding product failed" });
  }
};

// Get all products by owner
exports.getHostProducts = async (req, res, next) => {
  try {
    const owner = req.session.user._id;
    const products = await Product.find({ owner });
    res.json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get products" });
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Delete product image from server
    const productImagePath = path.join(__dirname, "..", product.productImage);
    if (fs.existsSync(productImagePath)) {
      fs.unlinkSync(productImagePath);
    }

    // This will trigger your middleware to remove productId from user favourites/cart
    await Product.findOneAndDelete({ _id: productId });
    await cleanUserData();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};

// Get single product details
exports.getProductDetails = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    res.status(200).json({ product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get product details" });
  }
};

// Get product for editing
exports.getEditProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    const imageUrl = `${req.protocol}://${req.get("host")}${
      product.productImage
    }`;
    res.status(200).json({ product: { ...product.toObject(), imageUrl } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get product for edit" });
  }
};

// Update Product
exports.putEditProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const {
      productName,
      productDescription,
      productPrice,
      productStock,
      productCategory,
    } = req.body;

    if (!VALID_CATEGORIES.includes(productCategory)) {
      return res.status(400).json({ error: "Invalid product category." });
    }
    const inStock = productStock > 0;
    const updatedFields = {
      productName,
      productDescription,
      productPrice,
      productStock,
      productCategory,
      inStock,
    };

    // Handle image replacement
    if (req.file) {
      const product = await Product.findById(productId);

      if (product?.productImage) {
        const oldImagePath = path.join(__dirname, "..", product.productImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      updatedFields.productImage = "/uploads/" + req.file.filename;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updatedFields,
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Product updated", product: updatedProduct });
  } catch (error) {
    console.error("Edit failed:", error);
    res.status(500).json({ message: "Product update failed" });
  }
};
