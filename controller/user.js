const Product = require("../model/Product");

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate("owner");
    res.status(200).json({ products });
  } catch (error) {
    console.log(error);
  }
};

exports.getProductDetails = async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id).populate("owner");
    res.status(200).json({ product });
  } catch (error) {
    console.log(error);
  }
};
