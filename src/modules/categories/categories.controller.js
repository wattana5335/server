const { prisma } = require('../../config/prisma')

exports.create = async (req, res) => {
  try {
    const { name } = req.body
    const category = await prisma.category.create({
      data: { name },
    })

    return res.status(201).json({ status: true, data: category })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: false, message: 'Internal service error' })
  }
}

exports.list = async (req, res) => {
  try {
    const category = await prisma.category.findMany()
    return res.status(200).json({ status: true, data: category })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: false, message: 'Internal service error' })
  }
}

exports.remove = async (req, res) => {
  try {
    const { id } = req.params
    const category = await prisma.category.delete({
      where: { id },
    })

    return res.status(204).json({ status: true, data: category })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: false, message: 'Internal service error' })
  }
}
