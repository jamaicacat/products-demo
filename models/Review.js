const mongoose = require('mongoose')

const ReviewSchema = mongoose.Schema(
	{
		rating: {
			type: Number,
			required: [true, 'Provide review rating'],
			min: 1,
			max: 5,
		},
		title: {
			type: String,
			required: [true, 'Provide review title'],
			trim: true,
			maxLength: [100, 'Review title cannot be more than 100 symbols'],
		},
		comment: {
			type: String,
			required: [true, 'Provide review text'],
		},
		user: {
			type: mongoose.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		product: {
			type: mongoose.Types.ObjectId,
			ref: 'Product',
			required: true,
		},
	},
	{ timestamps: true },
)

ReviewSchema.index({ product: 1, user: 1 }, { unique: true })

ReviewSchema.statics.calculateAverageRating = async function (productId) {
	const result = await this.aggregate([
		{ $match: { product: productId } },
		{
			$group: {
				_id: null,
				averageRating: { $avg: '$rating' },
				numOfReviews: { $sum: 1 },
			},
		},
	])

	try {
		await this.model('Product').findByIdAndUpdate(productId, {
			averageRating: Math.ceil(result[0]?.averageRating || 0),
			numOfReviews: result[0]?.numOfReviews || 0,
		})
	} catch (error) {
		console.log('calcavgrating', error.message)
	}
}

ReviewSchema.post('save', async function (next) {
	await this.constructor.calculateAverageRating(this.product)
})

ReviewSchema.post('remove', async function (next) {
	await this.constructor.calculateAverageRating(this.product)
})

module.exports = mongoose.model('Review', ReviewSchema)
