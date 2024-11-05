const { prisma } = require('../../config/prisma')
const { cloudinary } = require('../../config/cloudinary')
const { getPublicIdFromPath } = require('../../utils/helper')

exports.create = async (req, res) => {
  try {
    const { title, description, price, quantity, categoryId } = req.body

    // Handle uploaded files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ status: false, message: 'No images uploaded' })
    }

    // Create image objects from uploaded files
    const images = req.files.map((file) => {
      return {
        publicId: file.filename,
        url: file.path,
      }
    })

    // Create product with images
    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: Number.parseInt(price),
        quantity: Number.parseInt(quantity),
        categoryId,
        images: {
          create: images,
        },
      },
      include: {
        images: true,
      },
    })

    return res.status(201).json(product)
  } catch (err) {
    console.error(err)

    // If error occurs, attempt to delete uploaded files
    if (req.files) {
      try {
        const deletePromises = req.files.map((file) => {
          const publicId = getPublicIdFromPath(file.path)
          return cloudinary.uploader.destroy(publicId)
        })

        await Promise.all(deletePromises)
      } catch (deleteErr) {
        console.error('Error cleaning up files:', deleteErr)
      }
    }

    return res.status(500).json({ status: false, message: 'Internal service error' })
  }
}

exports.list = async (req, res) => {
  try {
    const { count } = req.params
    const products = await prisma.product.findMany({
      take: Number.parseInt(count),
      orderBy: { createdAt: 'desc' },
      include: { category: true, images: true },
    })

    return res.status(200).json({ status: true, data: products })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: false, message: 'Internal service error' })
  }
}

exports.read = async (req, res) => {
  try {
    const { id } = req.params
    const products = await prisma.product.findFirst({
      where: { id },
      include: { category: true, images: true },
    })

    return res.status(200).send({ status: true, data: products })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: false, message: 'Internal service error' })
  }
}

exports.update = async (req, res) => {
  try {
    const { id: productId } = req.params
    const { title, description, price, quantity, categoryId } = req.body

    // 1. First get the existing product with its images
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    })

    if (!existingProduct) return res.status(404).json({ status: false, message: 'Product not found' })

    // 2. Delete old images from Cloudinary
    if (existingProduct.images.length > 0) {
      try {
        const deletePromises = existingProduct.images.map((image) => {
          const publicId = getPublicIdFromPath(image.url)
          return cloudinary.uploader.destroy(publicId)
        })
        await Promise.all(deletePromises)
      } catch (cloudinaryError) {
        console.error('Error deleting old images from Cloudinary:', cloudinaryError)
      }
    }

    // 3. Process new images if they were uploaded
    let newImages = []
    if (req.files && req.files.length > 0) {
      newImages = req.files.map((file) => ({
        public_id: getPublicIdFromPath(file.path),
        asset_id: file.filename,
        url: file.path,
      }))
    }

    // 4. Update the product with new data
    const updatedProduct = await prisma.$transaction(async (prisma) => {
      // Delete all existing images from database
      await prisma.image.deleteMany({
        where: { id: productId },
      })

      // Update product with new data and images
      return prisma.product.update({
        where: { id: productId },
        data: {
          title,
          description,
          price: parseFloat(price),
          quantity: parseInt(quantity),
          categoryId,
          images: {
            create: newImages,
          },
        },
        include: {
          images: true,
        },
      })
    })

    return res.status(201).json({ status: true, data: updatedProduct })
  } catch (err) {
    console.error(err)

    // If error occurs during update, cleanup any newly uploaded files
    if (req.files) {
      try {
        const deletePromises = req.files.map((file) => {
          const publicId = getPublicIdFromPath(file.path)
          return cloudinary.uploader.destroy(publicId)
        })
        await Promise.all(deletePromises)
      } catch (deleteErr) {
        console.error('Error cleaning up new files:', deleteErr)
      }
    }

    return res.status(500).json({ status: false, message: 'Internal service error' })
  }
}

exports.remove = async (req, res) => {
  try {
    const { id } = req.params

    // Step 1 ค้นหาสินค้า include images
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    })

    if (!product) return res.status(404).json({ message: 'Product not found!!' })

    // Step 2 Promise ลบรูปภาพใน cloud ลบแบบ รอฉันด้วย
    if (product.images.length > 0) {
      const deletePromises = product.images.map((image) => {
        const publicId = getPublicIdFromPath(image.url)
        return cloudinary.uploader.destroy(publicId)
      })

      await Promise.all(deletePromises)
    }

    // Step 3 ลบสินค้า
    await prisma.product.delete({
      where: { id },
    })

    return res.status(204).json({ status: true, message: 'Deleted Success' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: false, message: 'Internal service error' })
  }
}

const handleQuery = async (req, res, query) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        title: {
          contains: query,
        },
      },
      include: {
        category: true,
        images: true,
      },
    })

    return res.status(200).json({ status: true, data: products })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: false, message: 'Internal service error' })
  }
}

const handleCategory = async (req, res, categoryId) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId: {
          in: categoryId.map((id) => id),
        },
      },
      include: {
        category: true,
        images: true,
      },
    })

    return res.status(200).json({ status: true, data: products })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: false, message: 'Internal service error ' })
  }
}

const handlePrice = async (req, res, priceRange) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        price: {
          gte: priceRange[0],
          lte: priceRange[1],
        },
      },
      include: {
        category: true,
        images: true,
      },
    })

    return res.status(200).json({ status: true, data: products })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: false, message: 'Internal service error ' })
  }
}

exports.searchFilters = async (req, res) => {
  try {
    const { query, category, price } = req.body

    if (query) return await handleQuery(req, res, query)

    if (category) return await handleCategory(req, res, category)

    if (price) return await handlePrice(req, res, price)

    return res.status(404).json({ status: false, message: 'not found' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: false, message: 'Internal service error' })
  }
}
