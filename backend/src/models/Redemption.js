import mongoose from 'mongoose';

const redemptionSchema = new mongoose.Schema(
  {
    redemptionCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reward',
      required: true,
    },
    rewardName: {
      type: String,
      required: true,
    },
    coinCost: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Redeemed', 'Cancelled'],
      default: 'Pending',
    },
    qrCodeDataUrl: {
      type: String,
      default: '',
    },
    redeemedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

redemptionSchema.index({ student: 1, status: 1 });

export const Redemption = mongoose.model('Redemption', redemptionSchema);
