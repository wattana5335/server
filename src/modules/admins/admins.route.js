const express = require('express')

const { authCheck } = require('../../middlewares/authCheck')
const { getOrderAdmin, changeOrderStatus } = require('./admins.controller')

const router = express.Router()

router.put('/admin/order-status', authCheck, changeOrderStatus)
router.get('/admin/orders', authCheck, getOrderAdmin)

module.exports = router
