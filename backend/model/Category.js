import mongoose from 'mongoose';

const subCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    required: false,
  },
});

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  image: {
    type: String, // Field to store the image URL or path
    required: false, // Image is not strictly required initially
  },
  subCategories: [subCategorySchema],
});

const Category = mongoose.model('Category', categorySchema);

export default Category;

