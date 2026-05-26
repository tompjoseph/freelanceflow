const express = require('express');
const Project = require('../models/Project');
const Payment = require('../models/Payment');
const DomainHosting = require('../models/DomainHosting');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id }).sort('-createdAt');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, status, startDate, endDate, paymentAdvance, paymentBalance, paymentCurrency, paymentStatus, paymentDate, paymentNotes } = req.body;
    const project = await Project.create({
      user: req.user._id,
      title,
      description,
      status,
      startDate,
      endDate,
    });

    if (paymentAdvance || paymentBalance) {
      await Payment.create({
        user: req.user._id,
        project: project._id,
        advanceAmount: Number(paymentAdvance) || 0,
        balanceAmount: Number(paymentBalance) || 0,
        currency: paymentCurrency || 'INR',
        status: paymentStatus || 'pending',
        paymentDate: paymentDate || new Date(),
        notes: paymentNotes || '',
      });
    }

    const populated = await project.populate('payments');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await Payment.deleteMany({ project: req.params.id, user: req.user._id });
    await DomainHosting.deleteMany({ project: req.params.id, user: req.user._id });

    res.json({ message: 'Project and associated data deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
