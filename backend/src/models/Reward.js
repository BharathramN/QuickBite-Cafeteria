import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema(
  {
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
    coinCost: {
      type: Number,
      required: true,
      min: 1,
    },
    category: {
      type: String,
      default: 'Snack & Beverage',
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Reward = mongoose.model('Reward', rewardSchema);
