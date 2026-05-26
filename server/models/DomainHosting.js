const mongoose = require('mongoose');

const domainHostingSchema = new mongoose.Schema({
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
  domainName: {
    type: String,
    trim: true,
    default: '',
  },
  domainProvider: {
    type: String,
    trim: true,
    default: '',
  },
  domainExpiryDate: {
    type: Date,
  },
  hostingProvider: {
    type: String,
    trim: true,
    default: '',
  },
  hostingExpiryDate: {
    type: Date,
  },
  renewalCost: {
    type: Number,
    min: 0,
    default: 0,
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('DomainHosting', domainHostingSchema);
