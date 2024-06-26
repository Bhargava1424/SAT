const express = require('express');
const router = express.Router();
const ECA = require('../models/ECA');

// Get all ECA entries
router.get('/', async (req, res) => {
  try {
    const ecas = await ECA.find();
    res.json(ecas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get ECA entries for a specific student by application number
router.get('/:applicationNumber', async (req, res) => {
  try {
    const ecas = await ECA.find({ applicationNumber: req.params.applicationNumber });
    res.json(ecas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit new ECA entry
router.post('/', async (req, res) => {
  const eca = new ECA(req.body);
  try {
    const newECA = await eca.save();
    res.status(201).json(newECA);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update ECA entry by ID
router.patch('/:id', getECA, async (req, res) => {
  // Update ECA fields
  try {
    const updatedECA = await res.eca.save();
    res.json(updatedECA);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete ECA entry by ID
router.delete('/:id', getECA, async (req, res) => {
  try {
    await res.eca.remove();
    res.json({ message: 'ECA entry deleted!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware to get ECA entry by ID
async function getECA(req, res, next) {
  let eca;
  try {
    eca = await ECA.findById(req.params.id);
    if (eca == null) {
      return res.status(404).json({ message: 'Cannot find ECA entry' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.eca = eca;
  next();
}

module.exports = router;