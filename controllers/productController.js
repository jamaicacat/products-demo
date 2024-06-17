const Product = require('../models/Product')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const fs = require('fs/promises')
const path = require('path')

const cloudinary = require('cloudinary').v2
cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.CLOUD_API_KEY,
	api_secret: process.env.CLOUD_API_SECRET,
})

const createProduct = async (req, res) => {
	req.body.user = req.user.userId
	const product = await Product.create(req.body)
	res.status(StatusCodes.CREATED).json({ product })
}

const getAllProducts = async (req, res) => {
	const products = await Product.find({})
	// todo implement sorting, pagination
	res.status(StatusCodes.OK).json({ products, count: products.length })
}

const getSingleProduct = async (req, res) => {
	const { id: productId } = req.params
	const product = await Product.findById(productId).populate('reviews')

	if (!product) {
		throw new CustomError.NotFoundError(`No product with id: ${productId}`)
	}

	res.status(StatusCodes.OK).json({ product })
}

const updateProduct = async (req, res) => {
	const { id: productId } = req.params

	const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
		new: true,
		runValidators: true,
	})

	if (!product) {
		throw new CustomError.NotFoundError(`No product with id: ${productId}`)
	}

	res.status(StatusCodes.OK).json({ product })
}

const deleteProduct = async (req, res) => {
	const { id: productId } = req.params
	const product = await Product.findById(productId)

	if (!product) {
		throw new CustomError.NotFoundError(`No product with id: ${productId}`)
	}

	await product.remove()
	res.status(StatusCodes.OK).json({ msg: 'Product successfully deleted' })
}

const uploadImage = async (req, res) => {
	if (!req.files) {
		throw new CustomError.BadRequestError('Provide image to upload')
	}

	const { image } = req.files

	if (!image.mimetype.startsWith('image')) {
		throw CustomError.BadRequestError('Wrong file type. Provide image')
	}

	const result = await cloudinary.uploader
		.upload(image.tempFilePath, {
			public_id: `${Date.now()}-${path.parse(image.name).name}`,
			use_filename: true,
			folder: 'e-commerce',
		})
		.catch((err) => {
			throw new CustomError.CustomAPIError(
				`Could not upload file image: ${err.message}`,
			)
		})

	fs.unlink(image.tempFilePath)

	res.status(StatusCodes.OK).json({ image: { src: result.secure_url } })
}

module.exports = {
	createProduct,
	getAllProducts,
	getSingleProduct,
	updateProduct,
	deleteProduct,
	uploadImage,
}
