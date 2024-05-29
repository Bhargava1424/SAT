const express = require('express');
const ECA = require('../models/Eca'); // Adjust the path as necessary
const router = express.Router();

// Route to post ECA data
router.post('/', async (req, res) => {
  try {
    const newECA = new ECA(req.body);
    await newECA.save();
    res.status(201).send(newECA);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Route to get ECA data sorted by date
router.get('/eca', async (req, res) => {
  try {
    const ecas = await ECA.find({}).sort('date');
    res.status(200).send(ecas);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Route to get ECA data for a specific student, sorted by date
router.get('/:studentName', async (req, res) => { // Changed from '/eca/:studentName' to '/:studentName'
    try {
        const studentName = decodeURIComponent(req.params.studentName);
        const ecas = await ECA.find({ studentName }).sort('date');
        res.status(200).send(ecas);
    } catch (error) {
        res.status(500).send(error);
    }
});



  
module.exports = router;
