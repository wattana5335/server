const express = require('express')

const { authCheck, adminCheck } = require('../../middlewares/authCheck')
const { create, list, remove } = require('./categories.controller')

const router = express.Router()

router.post('/category', create)
router.get('/category', list)
router.delete('/category/:id', authCheck, adminCheck, remove)

module.exports = router
