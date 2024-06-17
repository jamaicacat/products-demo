const mongoose = require('mongoose')

const ProductSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Provide product name'],
			minLength: 5,
			maxLength: [100, 'Name cannot be more then 100 characters'],
			trim: true,
		},
		price: {
			type: Number,
			required: [true, 'Provide product price'],
			default: 0,
		},
		description: {
			type: String,
			required: [true, 'Provide product description'],
			maxLength: [1000, 'Description cannot be more then 1000 characters'],
		},
		image: {
			type: String,
			default: '/uploads/example.png',
		},
		category: {
			type: String,
			required: [true, 'Provide product category'],
			enum: ['office', 'kitchen', 'bedroom'],
		},
		company: {
			type: String,
			required: [true, 'Provide product company'],
			enum: {
				values: ['ikea', 'liddy', 'marcos'],
				message: '{VALUE} is not supported',
			},
		},
		colors: {
			type: [String],
			default: ['#222'],
			required: [true, 'Provide product color'],
		},
		featured: {
			type: Boolean,
			default: false,
		},
		freeShipping: {
			type: Boolean,
			default: false,
		},
		inventory: {
			type: Number,
			required: true,
			default: 15,
		},
		averageRating: {
			type: Number,
			default: 0,
		},
		numOfReviews: {
			type: Number,
			default: 0,
		},
		user: {
			type: mongoose.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
)

ProductSchema.virtual('reviews', {
	ref: 'Review',
	localField: '_id',
	foreignField: 'product',
	justOne: false,
})

ProductSchema.pre('remove', async function (next) {
	await this.model('Review').deleteMany({ product: this._id })
})

module.exports = mongoose.model('Product', ProductSchema)
