const mongoose = require('mongoose')

const PaymentStatus = require('../enums/payment')

const SingleOrderItemSchema = mongoose.Schema({
	name: { type: String, required: true },
	image: { type: String, required: true },
	price: { type: Number, required: true },
	amount: { type: Number, required: true },
	product: {
		type: mongoose.Types.ObjectId,
		ref: 'Product',
		required: true,
	},
})

const OrderSchema = mongoose.Schema(
	{
		tax: {
			type: Number,
			required: true,
		},
		shippingFee: {
			type: Number,
			required: true,
		},
		subtotal: {
			type: Number,
			required: true,
		},
		total: {
			type: Number,
			required: true,
		},
		orderItems: [SingleOrderItemSchema],
		status: {
			type: String,
			enum: [
				PaymentStatus.PENDING,
				PaymentStatus.FAILED,
				PaymentStatus.PAID,
				PaymentStatus.DELIVERED,
				PaymentStatus.CANCELED,
			],
			default: PaymentStatus.PENDING,
		},
		user: {
			type: mongoose.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		clientSecret: {
			type: String,
			required: true,
		},
		paymentIntentId: {
			type: String,
		},
	},
	{ timestampts: true },
)

module.exports = mongoose.model('Order', OrderSchema)
