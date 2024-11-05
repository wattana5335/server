const { prisma } = require('../../config/prisma')

const findAllusers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      enabled: true,
      address: true,
    },
  })
}

const findExistedUser = async (args) => {
  const { id } = args

  return await prisma.user.findUnique({ where: { id }, select: { id: true } })
}

const updateUserStatus = async (args) => {
  const { id, enabled } = args

  return await prisma.user.update({ where: { id }, data: { enabled } })
}

const updateUserRole = async (args) => {
  const { id, role } = args

  return await prisma.user.update({ where: { id }, data: { role } })
}

const findExistedProduct = async (args) => {
  const { id } = args

  return await prisma.product.findUnique({ where: { id }, select: { quantity: true, title: true } })
}

const deleteAllProductOnCartByUserId = async (args) => {
  const { id } = args

  return await prisma.productOnCart.deleteMany({ where: { cart: { orderedById: id } } })
}

const deleteItemsInCartByUserId = async (args) => {
  const { id } = args

  return await prisma.cart.deleteMany({ where: { orderedById: id } })
}

const createCart = async (args) => {
  const { products, cartTotal, userId } = args

  return await prisma.cart.create({
    data: {
      products: { create: products },
      cartTotal: cartTotal,
      orderedById: userId,
    },
  })
}

const findCartWithProductsByUserId = async (args) => {
  const { id } = args

  return await prisma.cart.findFirst({
    where: { orderedById: id },
    include: {
      products: {
        include: {
          product: {
            include: {
              images: {
                select: {
                  url: true,
                },
              },
            },
          },
        },
      },
    },
  })
}

const findCartByUserId = async (args) => {
  const { id } = args

  return await prisma.cart.findFirst({ where: { orderedById: id } })
}

const deleteAllProductsOnCartByCartId = async (args) => {
  const { id } = args

  return await prisma.productOnCart.deleteMany({
    where: { cartId: id },
  })
}

const updateUserAddress = async (args) => {
  const { id, address } = args

  return await prisma.user.update({ where: { id }, data: { address: address } })
}

module.exports = {
  findAllusers,
  findExistedUser,
  updateUserStatus,
  updateUserRole,
  findExistedProduct,
  deleteAllProductOnCartByUserId,
  deleteItemsInCartByUserId,
  createCart,
  findCartWithProductsByUserId,
  findCartByUserId,
  deleteAllProductsOnCartByCartId,
  updateUserAddress,
}
