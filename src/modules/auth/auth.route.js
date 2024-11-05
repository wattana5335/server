const express = require('express')

const { authCheck, adminCheck } = require('../../middlewares/authCheck')
const { register, login, currentUser } = require('./auth.controller')

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/current-user', authCheck, currentUser)
router.post('/current-admin', authCheck, adminCheck, currentUser)

module.exports = router
