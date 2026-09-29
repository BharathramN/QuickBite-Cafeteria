import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

const dailyMenuSchema = new mongoose.Schema(
  {
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      unique: true,
    },
    cutoffTime: {
      type: String, // Format: "08:30" (24h time)
      required: true,
      default: '09:00',
    },
    veg: {
      type: menuItemSchema,
      required: true,
    },
    nonVeg: {
      type: menuItemSchema,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const DailyMenu = mongoose.model('DailyMenu', dailyMenuSchema);
