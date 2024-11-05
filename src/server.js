require('dotenv').config()

const express = require('express')

const cors = require('cors')
const morgan = require('morgan')

const router = require('./root.routes')

const app = express()

app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use(morgan('dev'))

app.use('/', router)

app.listen(8000, () => console.log('Server is running on port 8000'))
