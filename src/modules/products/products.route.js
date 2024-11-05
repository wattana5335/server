const express = require('express')

const { upload } = require('../../config/multer')
const { authCheck, adminCheck } = require('../../middlewares/authCheck')
const { create, list, read, update, remove, searchFilters } = require('./products.controller')

const router = express.Router()

router.post('/product', upload.array('images', 5), create)
router.get('/products/:count', list)
router.get('/product/:id', read)
router.put('/product/:id', upload.array('images', 5), update)
router.delete('/product/:id', remove)
router.post('/search/filters', searchFilters)

module.exports = router
