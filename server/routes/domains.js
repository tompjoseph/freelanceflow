const express = require('express');
const DomainHosting = require('../models/DomainHosting');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.projectId) filter.project = req.query.projectId;
    const entries = await DomainHosting.find(filter)
      .populate('project', 'title')
      .sort('-createdAt');
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/expiring', auth, async (req, res) => {
  try {
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const entries = await DomainHosting.find({
      user: req.user._id,
      $or: [
        { domainExpiryDate: { $gte: now, $lte: thirtyDays } },
        { hostingExpiryDate: { $gte: now, $lte: thirtyDays } },
      ],
    }).populate('project', 'title');
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const entry = await DomainHosting.create({
      user: req.user._id,
      ...req.body,
    });
    const populated = await entry.populate('project', 'title');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const entry = await DomainHosting.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('project', 'title');
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await DomainHosting.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
