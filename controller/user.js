const Product = require("../model/Product");

exports.getProducts = async (req, res, next) => {
  try {
    const { minPrice, maxPrice, inStock, sort, search, category } = req.query;

    const query = {};

    // 1. Filter by price
    if (minPrice || maxPrice) {
      query.productPrice = {};
      if (minPrice) query.productPrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.productPrice.$lte = parseFloat(maxPrice);
    }

    // 2. Filter by stock
    if (inStock === "true") {
      query.productStock = { $gt: 0 };
    }

    // 3. Search by name or description
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } },
        { productDescription: { $regex: search, $options: "i" } },
      ];
    }
    if (req.query.category) {
      query.productCategory = req.query.category;
    }

    // 5. Sorting
    const sortOption =
      sort === "asc"
        ? { productPrice: 1 }
        : sort === "desc"
        ? { productPrice: -1 }
        : {};

    // 6. Query DB and populate owner
    const products = await Product.find(query)
      .sort(sortOption)
      .populate("owner");

    res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error" });
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
exports.getHomePage = async (req, res, next) => {
  try {
    const allProducts = await Product.find();
    const topsales_products = allProducts.filter(
      (product) => product.productPrice > 100
    );

    res.json({ topsales_products });
  } catch (error) {
    next(error);
  }
};

exports.getCategoryProducts = async (req, res, next) => {
  try {
    const { category } = req.query;

    // If no category param OR it's "All", return all products
    if (!category || category === "All") {
      const filtered_products = await Product.find();
      return res.json({ filtered_products });
    }

    // Otherwise, filter by category
    const query = { productCategory: category };
    const filtered_products = await Product.find(query);
    res.json({ filtered_products });
  } catch (error) {
    next(error);
  }
};
