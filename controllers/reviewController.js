const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')

const { checkPermissions } = require('../utils')

const Review = require('../models/Review')
const Product = require('../models/Product')

const createReview = async (req, res) => {
	const { product: productId } = req.body

	const isValidProduct = await Product.findById(productId)

	if (!isValidProduct) {
		throw new CustomError.BadRequestError(`No product with id: ${productId}`)
	}

	const alreadyReviewed = await Review.findOne({
		product: productId,
		user: req.user.userId,
	})

	if (alreadyReviewed) {
		throw new CustomError.BadRequestError(
			'Already submitted review for this product',
		)
	}

	req.body.user = req.user.userId
	const review = await Review.create(req.body)

	res.status(StatusCodes.CREATED).json({ review })
}

const getAllReviews = async (req, res) => {
	//todo implement pagination
	const reviews = await Review.find({})
		.populate({
			path: 'user',
			select: 'name',
		})
		.populate({
			path: 'product',
			select: 'name company price',
		})
	res.status(StatusCodes.OK).json({ reviews, count: reviews.length })
}

const getSingleReview = async (req, res) => {
	const { id: reviewId } = req.params
	const review = await Review.findById(reviewId)
		.populate({
			path: 'user',
			select: 'name',
		})
		.populate({
			path: 'product',
			select: 'name company price',
		})

	if (!review) {
		throw new CustomError.NotFoundError(`No review with id: ${reviewId}`)
	}

	res.status(StatusCodes.OK).json({ review })
}

const updateReview = async (req, res) => {
	const { id: reviewId } = req.params
	const { rating, comment, title } = req.body
	const review = await Review.findById(reviewId)

	if (!review) {
		throw new CustomError.NotFoundError(`No review with id: ${reviewId}`)
	}

	checkPermissions(req.user, review.user)

	review.title = title
	review.rating = rating
	review.comment = comment

	await review.save()

	res.status(StatusCodes.OK).json({ review })
}

const deleteReview = async (req, res) => {
	const { id: reviewId } = req.params
	const review = await Review.findById(reviewId)

	if (!review) {
		throw new CustomError.NotFoundError(`No review with id: ${reviewId}`)
	}

	checkPermissions(req.user, review.user)

	await review.remove()

	res.status(StatusCodes.OK).json({ msg: 'Review successfully deleted' })
}

const getSingleProductReviews = async (req, res) => {
	const { id: productId } = req.params
	const reviews = await Review.find({ product: productId })

	res.status(StatusCodes.OK).json({ reviews, count: reviews.length })
}

module.exports = {
	createReview,
	getAllReviews,
	getSingleReview,
	updateReview,
	deleteReview,
	getSingleProductReviews,
}
