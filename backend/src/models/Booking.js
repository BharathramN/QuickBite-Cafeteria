import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
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
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    mealType: {
      type: String,
      enum: ['veg', 'non_veg'],
      required: true,
    },
    mealName: {
      type: String,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Collected', 'Cancelled'],
      default: 'Pending',
    },
    qrCodeDataUrl: {
      type: String,
      default: '',
    },
    collectedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    coinsAwarded: {
      type: Boolean,
      default: false,
    },
    pickupPoint: {
      type: String,
      enum: ['Cafeteria TP1', 'Food joint UB building', 'Cafeteria Main block'],
      required: true,
      default: 'Cafeteria TP1',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast queries and integrity
bookingSchema.index({ student: 1, date: 1, status: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
