const express = require('express');
const router = express.Router();
const Car = require('../../models/car');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'deumoji1t',
  api_key: '835885467987919',
  api_secret: 'UdmBKn2EIutr9pNRJ7E5RQveiwM',
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    const userEmail = req.body.email;
    const fileExtension = path.extname(file.originalname);
    cb(null, userEmail + fileExtension); // Use email.png as the filename
  },
});

// Set up multer upload configuration
const upload = multer({ storage: storage });


router.get('/allCars', (req, res) => {
  const selectedCity = req.query.city;
  const selectedAvailableDate = req.query.available;
  const selectedDropDate = req.query.drop;

  const filters = {};
  if (selectedCity) {
    filters.city = selectedCity;
  }
  if (selectedAvailableDate && selectedDropDate) {
    filters.available = { $gte: new Date(selectedAvailableDate), $lte: new Date(selectedDropDate) };
  }

  Car.find(filters)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error retrieving data');
    });
});



router.post('/saveCars', upload.single('carImage'), async (req, res) => {
  const userEmail = req.body.email;
    const data = new Car({
      email: userEmail,
      carName: req.body.carName,
      desc: req.body.desc,
      available: req.body.available,
      DropDate: req.body.DropDate,
      city: req.body.city,
  
    });

    await data.save();
    res.json(data);
  } 
);

// Endpoint to serve the car image from Cloudinary
router.get('/carImage/:email', (req, res) => {
  const userEmail = req.params.email;
  const imageUrl = `https://res.cloudinary.com/your_cloud_name/image/upload/${userEmail}`;
  res.redirect(imageUrl);
});


/////

router.put('/editCar/:id', async (req, res) => {
  const carId = req.params.id;
  const updatedData = {
    carName: req.body.carName,
    desc: req.body.desc,
    available: req.body.available,
    DropDate: req.body.DropDate,
    city: req.body.city,
  };

  try {
    const updatedCar = await Car.findByIdAndUpdate(carId, updatedData, { new: true });
    if (!updatedCar) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json(updatedCar);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating car');
  }
});



////////

router.delete('/deleteCar/:id', async (req, res) => {
  const carId = req.params.id;

  try {
    const deletedCar = await Car.findByIdAndDelete(carId);
    if (!deletedCar) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json(deletedCar);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting car');
  }
});



module.exports = router;
