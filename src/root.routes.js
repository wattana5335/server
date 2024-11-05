const express = require('express')

const authRouter = require('./modules/auth/auth.route')
const adminRouter = require('./modules/admins/admins.route')
const userRouter = require('./modules/users/users.route')
const categoryRouter = require('./modules/categories/categories.route')
const productRouter = require('./modules/products/products.route')

const router = express.Router()

router.use('/api', authRouter)
router.use('/api', adminRouter)
router.use('/api', userRouter)
router.use('/api', categoryRouter)
router.use('/api', productRouter)

module.exports = router
