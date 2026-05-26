const express = require('express');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.projectId) filter.project = req.query.projectId;
    const payments = await Payment.find(filter)
      .populate('project', 'title')
      .sort('-paymentDate');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { project, advanceAmount, balanceAmount, currency, paymentDate, status, notes } = req.body;
    const payment = await Payment.create({
      user: req.user._id,
      project,
      advanceAmount: Number(advanceAmount) || 0,
      balanceAmount: Number(balanceAmount) || 0,
      currency,
      paymentDate,
      status,
      notes,
    });
    const populated = await payment.populate('project', 'title');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('project', 'title');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
