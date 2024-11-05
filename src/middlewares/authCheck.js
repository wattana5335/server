const jwt = require('jsonwebtoken')

const { prisma } = require('../config/prisma')

exports.authCheck = async (req, res, next) => {
  try {
    const { authorization: headerToken } = req.headers

    if (!headerToken) return res.status(401).json({ status: false, message: 'No Token, Authorization' })

    const token = headerToken.split(' ')[1]
    const decode = jwt.verify(token, process.env.SECRET)

    req.user = decode

    const user = await prisma.user.findFirst({ where: { email: req.user.email } })

    if (!user.enabled) return res.status(400).json({ status: false, message: 'This account cannot access' })

    return next()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: false, message: 'Internal service error' })
  }
}

exports.adminCheck = async (req, res, next) => {
  try {
    const { email } = req.user

    const adminUser = await prisma.user.findFirst({ where: { email } })

    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ status: false, message: 'Access Denied: Admin Only' })
    }

    return next()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: false, message: 'Internal service error' })
  }
}
