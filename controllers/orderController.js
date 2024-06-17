const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { checkPermissions } = require('../utils')

const Order = require('../models/Order')
const Product = require('../models/Product')

const PaymentStatus = require('../enums/payment')

const fakeStripeAPI = async ({ amount, currency }) => {
	const clientSecret = 'random'
	return { clientSecret, amount }
}

const createOrder = async (req, res) => {
	const { items: cartItems, tax, shippingFee } = req.body

	if (!cartItems || cartItems.length < 1) {
		throw new CustomError.BadRequestError('No cart items provided')
	}

	if (!tax || !shippingFee) {
		throw new CustomError.BadRequestError('Provide tax and shipping fee')
	}

	let orderItems = []
	let subtotal = 0

	for (const item of cartItems) {
		const dbProduct = await Product.findById(item.product)

		if (!dbProduct) {
			throw new CustomError.BadRequestError(
				`No product with id: ${item.product}`,
			)
		}

		const { name, price, image, _id } = dbProduct
		const singleOrderItem = {
			amount: item.amount,
			name,
			price,
			image,
			product: _id,
		}

		orderItems.push(singleOrderItem)
		subtotal += price * item.amount
	}

	const total = tax + shippingFee + subtotal

	// mock stripe data
	const paymentIntent = await fakeStripeAPI({ amount: total, currency: 'usd' })

	const order = await Order.create({
		orderItems,
		total,
		subtotal,
		tax,
		shippingFee,
		clientSecret: paymentIntent.clientSecret,
		user: req.user.userId,
	})

	res.status(StatusCodes.OK).json({ order, clientSecret: order.clientSecret })
}

const getAllOrders = async (req, res) => {
	const orders = await Order.find({})
	res.status(StatusCodes.OK).json({ orders, count: orders.length })
}

const getSingleOrder = async (req, res) => {
	const { id: orderId } = req.params
	const order = await Order.findById(orderId)

	if (!order) {
		throw new CustomError.NotFoundError(`No order with id: ${orderId}`)
	}

	checkPermissions(req.user, order.user)
	res.status(StatusCodes.OK).json({ order })
}

const getCurrentUserOrders = async (req, res) => {
	const orders = await Order.find({ user: req.user.userId })

	res.status(StatusCodes.OK).json({ orders, count: orders.length })
}

const updateOrder = async (req, res) => {
	const { id: orderId } = req.params
	const { paymentIntentId } = req.body

	const order = await Order.findById(orderId)

	if (!order) {
		throw new CustomError.NotFoundError(`No order with id: ${orderId}`)
	}
	checkPermissions(req.user, order.user)

	order.paymentIntentId = paymentIntentId
	order.status = PaymentStatus.PAID

	await order.save()

	res.status(StatusCodes.OK).json({ order })
}

module.exports = {
	getAllOrders,
	getSingleOrder,
	getCurrentUserOrders,
	createOrder,
	updateOrder,
}
