import asyncHandler from '../middleware/async-handler.js';
import Product from '../models/product-model.js';

// Fetch all products GET /api/products @Public
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// Fetch single product GET /api/products/:id @Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    return res.json(product);
  }
  res.status(404);
  throw new Error('Resource not found');
});

// Create a product POST /api/products @Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Sample name',
    price: 0,
    user: req.user._id,
    image: '/images/sample.jpg',
    brand: 'Sample brand',
    category: 'Sample category',
    countInStock: 0,
    numReviews: 0,
    description: 'Sample description',
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// Update a product PUT /api/products/:id @Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {name, price, description, image, brand, category, countInStock} = req.body
  const product = await Product.findById(req.params.id)

  if (product) {
    product.name = name
    product.price = price
    product.description = description
    product.image = image
    product.brand = brand
    product.category = category
    product.countInStock = countInStock

    const updatedProduct = await product.save()
    res.json(updatedProduct)
  } else {
    res.status(404)
    throw new Error('Resource not found')
  }
});

// Delete a product DELETE /api/products/:id @Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {

  const product = await Product.findById(req.params.id)

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.status(200).json({message: 'Product deleted'})
  } else {
    res.status(404)
    throw new Error('Resource not found')
  }
});

// Create a new review POST /api/products/:id/reviews @Private/Admin
const createProductReview = asyncHandler(async (req, res) => {
  const {rating, comment} = req.body

  const product = await Product.findById(req.params.id)

  if (product) {
   const alreadyReviewed = product.reviews.find(
     (review) => review.user.toString() === req.user._id.toString()
   );

  if (alreadyReviewed) {
    res.status(400)
    throw new Error('Product already reviewed')
  }

  const review = {
    name: req.user.name,
    rating: Number(rating),
    comment,
    user: req.user._id,
  };

  product.reviews.push(review)

  product.numReviews = product.reviews.length

  product.rating =
    product.reviews.reduce((acc, review) => acc + review.rating, 0) /
    product.reviews.length;

    await product.save()
    res.status(201).json({ message: 'Review added' });

  } else {
    res.status(404)
    throw new Error('Product already reviewed')
  }
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview
};