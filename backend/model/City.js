import mongoose from 'mongoose';

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  assignedCategories: [
    {
      category: {
        type: String,
        required: true,
      },
      subCategories: [String],
    },
  ],
}, {
  timestamps: true,
});

const City = mongoose.model('City', citySchema);

export default City;
