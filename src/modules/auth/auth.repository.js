const { prisma } = require('../../config/prisma')

const findUserByEmail = async (args) => {
  const { email } = args

  return await prisma.user.findFirst({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      enabled: true,
      role: true,
    },
  })
}

const findUserOmitPassword = async (args) => {
  const { email } = args

  return await prisma.user.findFirst({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  })
}

const createUser = async (args) => {
  const { email, password } = args

  return await prisma.user.create({ data: { email, password } })
}

module.exports = {
  findUserByEmail,
  findUserOmitPassword,
  createUser,
}
