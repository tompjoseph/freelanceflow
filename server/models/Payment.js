const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  advanceAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  balanceAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  currency: {
    type: String,
    default: 'INR',
    trim: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending',
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

paymentSchema.virtual('totalAmount').get(function () {
  return (this.advanceAmount || 0) + (this.balanceAmount || 0);
});

module.exports = mongoose.model('Payment', paymentSchema);
