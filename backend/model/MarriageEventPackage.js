import mongoose from 'mongoose';

const marriageEventPackageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true },
    discounted_price: { type: Number },
    hall_name: { type: String, trim: true },
    hall_description: { type: String, trim: true },
    images: [{ type: String }],
    catering_details: { type: String },
    decoration_details: { type: String },
    sound_dj_details: { type: String },
    photography_videography_details: { type: String },
    makeup_details: { type: String },
    lighting_details: { type: String },
    tent_details: { type: String },
    mehandi_artist_details: { type: String },
    band_details: { type: String },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const MarriageEventPackage = mongoose.model(
  'MarriageEventPackage',
  marriageEventPackageSchema,
  'marriage_event_packages' // exact collection name
);

export default MarriageEventPackage;
