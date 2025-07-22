const Product = require("../model/Product");
const User = require("../model/User");
const fs = require("fs");
const path = require("path");

// Add Product
exports.postAddProduct = async (req, res, next) => {
  try {
    const { productName, productDescription, productPrice, productStock } =
      req.body;
    const owner = req.session.user._id;

    const imagePath = req.file ? "/uploads/" + req.file.filename : null;

    if (!imagePath) {
      return res.status(400).json({ error: "Image upload failed" });
    }

    const product = new Product({
      productName,
      productDescription,
      productPrice,
      productImage: imagePath,
      owner,
      productStock,
    });

    await product.save();
    res.status(200).json({ product });
  } catch (error) {
    console.error(error);
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

// Delete Product
exports.postDeleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const productImagePath = path.join(__dirname, "..", product.productImage);
    if (fs.existsSync(productImagePath)) {
      fs.unlinkSync(productImagePath);
    }

    await Product.findByIdAndDelete(productId);
    await User.updateMany(
      { favourites: productId },
      { $pull: { favourites: productId } }
    );

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

    const updatedFields = {
      productName: req.body.productName,
      productDescription: req.body.productDescription,
      productPrice: req.body.productPrice,
      productStock: req.body.productStock,
    };

    if (req.file) {
      const product = await Product.findById(productId);

      // Delete old image
      if (product.productImage) {
        const oldImagePath = path.join(__dirname, "..", product.productImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // New image
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
