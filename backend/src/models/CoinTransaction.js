import mongoose from 'mongoose';

const coinTransactionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['EARNED_BOOKING', 'WELCOME_BONUS', 'REDEEMED_REWARD', 'REFUND'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    referenceId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

coinTransactionSchema.index({ student: 1, createdAt: -1 });

export const CoinTransaction = mongoose.model('CoinTransaction', coinTransactionSchema);
