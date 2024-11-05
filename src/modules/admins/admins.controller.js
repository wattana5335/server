const { prisma } = require('../../config/prisma')

exports.changeOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus } = req.body

    const orderUpdate = await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: orderStatus },
    })

    return res.status(201).json({ status: true, data: orderUpdate })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: false, message: 'Internal service error' })
  }
}

exports.getOrderAdmin = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        products: {
          include: {
            product: true,
          },
        },
        orderedBy: {
          select: {
            id: true,
            email: true,
            address: true,
          },
        },
      },
    })

    return res.status(200).json({ status: true, data: orders })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: false, message: 'Internal service error' })
  }
}
