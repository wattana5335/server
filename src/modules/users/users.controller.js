const { prisma } = require('../../config/prisma')

const {
  findAllusers,
  findExistedUser,
  updateUserStatus,
  updateUserRole,
  findExistedProduct,
  deleteAllProductOnCartByUserId,
  deleteItemsInCartByUserId,
  createCart,
  deleteAllProductsOnCartByCartId,
  findCartByUserId,
  updateUserAddress,
  findCartWithProductsByUserId,
} = require('./users.repository')

exports.listUsers = async (_, res) => {
  try {
    const users = await findAllusers()
    return res.status(200).json({ status: true, data: users })
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: false, message: 'Internal service error' })
  }
}

exports.changeStatus = async (req, res) => {
  try {
    const { id, enabled } = req.body

    const existedUser = await findExistedUser({ id })
    if (!existedUser) return res.status(404).json({ status: false, message: 'User not found' })

    const updatedUser = await updateUserStatus({ id, enabled })

    return res.status(201).json({ status: true, message: 'Update Status Success', data: updatedUser })
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: false, message: 'Internal service error' })
  }
}

exports.changeRole = async (req, res) => {
  try {
    const { id, role } = req.body

    const existedUser = await findExistedUser({ id })
    if (!existedUser) return res.status(404).json({ status: false, message: 'User not found' })

    const user = await updateUserRole({ id, role })

    return res.status(201).json({ status: true, message: 'Update Role Success', data: user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: false, message: 'Internal service error' })
  }
}

exports.userCart = async (req, res) => {
  try {
    const { cart } = req.body
    const { id: userId } = req.user

    const user = await findExistedUser({ id: userId })

    // Check quantity
    for (const item of cart) {
      const product = await findExistedProduct({ id: item.productId })

      if (!product || item.count > product.quantity) {
        return res.status(404).json({ status: false, message: `ขออภัย. สินค้า ${product?.title || 'product'} หมด` })
      }
    }

    // Deleted old Cart item
    await deleteAllProductOnCartByUserId({ id: user.id })

    // Deeted old Cart
    await deleteItemsInCartByUserId({ id: user.id })

    // เตรียมสินค้า
    let products = cart.map((item) => ({ productId: item.productId, count: item.count, price: item.price }))

    // หาผลรวม
    let cartTotal = products.reduce((sum, item) => sum + item.price * item.count, 0)

    // New cart
    const newCart = await createCart({ products, cartTotal, userId: user.id })

    return res.status(201).json({ status: true, message: 'Add Cart Ok', data: newCart })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: false, message: 'Internal service error' })
  }
}

exports.getUserCart = async (req, res) => {
  try {
    const { id: userId } = req.user

    const cart = await findCartWithProductsByUserId({ id: userId })

    if (!cart) return res.status(404).json({ status: false, message: 'This cart is empthy' })

    return res.status(200).json({ status: true, products: cart.products, cartTotal: cart.cartTotal })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: false, message: 'Internal service error' })
  }
}

exports.emptyCart = async (req, res) => {
  try {
    const { id: userId } = req.user

    const existedUser = await findExistedUser({ id: userId })
    if (!existedUser) return res.status(404).json({ status: false, message: 'User not found' })

    const cart = await findCartByUserId({ id: existedUser.id })

    if (!cart) return res.status(404).json({ status: false, message: 'No cart' })

    await deleteAllProductsOnCartByCartId({ id: cart.id })

    const result = await deleteItemsInCartByUserId({ id: existedUser.id })

    return res.status(200).json({ status: true, message: 'Cart Empty Success', data: result.count })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: false, message: 'Internal service error' })
  }
}

exports.saveAddress = async (req, res) => {
  try {
    const { address } = req.body
    const { id: userId } = req.user

    const existedUser = await findExistedUser({ id: userId })
    if (!existedUser) return res.status(404).json({ status: false, message: 'User not found' })

    const addressUser = await updateUserAddress({ id: existedUser.id, address })

    return res.status(201).json({ status: true, message: 'Address update success', data: addressUser })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: false, message: 'Internal service error' })
  }
}

exports.saveOrder = async (req, res) => {
  try {
    const { id: userId } = req.user

    const existedUser = await findExistedUser({ id: userId })
    if (!existedUser) return res.status(404).json({ status: false, message: 'User not found' })

    // Step 1 Get User Cart
    const userCart = await prisma.cart.findFirst({
      where: { orderedById: userId },
      include: { products: true },
    })

    // Step 2 Check Cart empty
    if (!userCart || userCart.products.length === 0) {
      return res.status(404).json({ status: false, message: 'Cart is Empty' })
    }

    // Step 3 Create a new Order
    const order = await prisma.order.create({
      data: {
        products: {
          create: userCart.products.map((item) => ({
            productId: item.productId,
            count: item.count,
            price: item.price,
          })),
        },
        orderedBy: {
          connect: { id: userId },
        },
        cartTotal: userCart.cartTotal,
      },
    })

    // Step 4 Update Product
    const update = userCart.products.map((item) => ({
      where: { id: item.productId },
      data: {
        quantity: { decrement: item.count },
        sold: { increment: item.count },
      },
    }))

    await Promise.all(update.map((updated) => prisma.product.update(updated)))

    // Step 5 Remove current cart
    await prisma.cart.deleteMany({
      where: { orderedById: userId },
    })

    return res.status(201).json({ status: true, data: order })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: false, message: 'Internal service error' })
  }
}

exports.getOrder = async (req, res) => {
  try {
    const { id: userId } = req.user

    const existedUser = await findExistedUser({ id: userId })
    if (!existedUser) return res.status(404).json({ status: false, message: 'User not found' })

    const orders = await prisma.order.findMany({
      where: { orderedById: existedUser.id },
      include: {
        products: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    })

    if (orders.length === 0) return res.status(404).json({ status: false, message: 'No orders' })

    return res.status(200).json({ status: true, data: orders })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: false, message: 'Internal service error' })
  }
}
