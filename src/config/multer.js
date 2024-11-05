const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')

const { cloudinary } = require('../config/cloudinary')

// Configure Multer + Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products', // Change this to your desired folder name
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
  },
})

// Initialize Multer with the storage engine
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5, // Maximum 5 files per request
  },
})

module.exports = { upload }
