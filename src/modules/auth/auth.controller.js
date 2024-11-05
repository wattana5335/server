const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { findUserByEmail, findUserOmitPassword, createUser } = require('./auth.repository')

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body

    // Step 1 Validate body
    if (!email) return res.status(400).json({ status: false, message: 'Email is required!!!' })

    if (!password) return res.status(400).json({ status: false, message: 'Password is required!!!' })

    // Step 2 Check Email in DB already ?
    const user = await findUserByEmail({ email })

    if (user) return res.status(400).json({ status: false, message: 'Email already exits!!' })

    // Step 3 HashPassword
    const hashPassword = await bcrypt.hash(password, 10)

    // Step 4 Register
    await createUser({ email, password: hashPassword })

    return res.status(201).json({ status: true, message: 'Register Success' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: false, message: 'Internal service error' })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Step 1 Check Email
    const user = await findUserByEmail({ email })

    if (!user || !user.enabled) return res.status(404).json({ status: false, message: 'User Not found or not Enabled' })

    // Step 2 Check password
    const isMatch = bcrypt.compareSync(password, user.password)
    if (!isMatch) return res.status(400).json({ status: false, message: 'Password Invalid!!!' })

    // Step 3 Create Payload
    const payload = { id: user.id, email: user.email, role: user.role }

    // Step 4 Generate Token
    jwt.sign(payload, process.env.SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) return res.status(500).json({ status: false, message: 'Internal service error' })

      return res.json({ status: true, payload, token })
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: false, message: 'Internal service error' })
  }
}

exports.currentUser = async (req, res) => {
  try {
    const { email } = req.user

    const user = await findUserOmitPassword({ email })

    return res.status(200).json({ status: true, data: user })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: false, message: 'Internal service error' })
  }
}
