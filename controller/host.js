const Product = require("../model/Product");
const User = require("../model/User");
exports.postAddProduct = async (req, res, next) => {
  const { productName, productDescription, productPrice, productStock } =
    req.body;
  const owner = req.session.user._id;

  const imagePath = req.file?.path
    ? "/" + req.file.path.replace(/\\/g, "/")
    : null;

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

  res.status(200).json({
    product,
  });
};

exports.getHostProducts = async (req, res, next) => {
  const owner = req.session.user._id;
  console.log("Product owner", owner);
  const products = await Product.find({ owner: owner });
  res.json({ products });
};

const fs = require("fs");
const path = require("path");

exports.postDeleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    // Find the product to get the image path before deletion
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete the product image file if it exists
    const productImagePath = path.join(__dirname, "..", product.productImage);

    if (fs.existsSync(productImagePath)) {
      fs.unlinkSync(productImagePath); // Delete the file
    }

    // Now, delete the product document from the database
    await Product.findByIdAndDelete(productId);
    await User.updateMany(
      { favourites: productId },
      { $pull: { favourites: productId } }
    );
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};

exports.getProductDetails = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    res.status(200).json({ product });
  } catch (error) {
    console.log(error);
  }
};

exports.getEditProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    console.log(product);
    const imageUrl = `${req.protocol}://${req.get("host")}${
      product.productImage
    }`;
    console.log(imageUrl);
    res.status(200).json({ product: { ...product.toObject(), imageUrl } });
  } catch (error) {
    console.log(error);
  }
};

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

      // Set new image path
      updatedFields.productImage =
        "/" + path.join("uploads", req.file.filename).replace(/\\/g, "/");
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
    console.log("Edit failed:", error);
    res.status(500).json({ message: "Product update failed" });
  }
};
