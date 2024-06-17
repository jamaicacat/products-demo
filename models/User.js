const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const RoleEnum = require('../enums/role')

const UserSchema = mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Provide name'],
		minLength: 3,
		maxLength: 20,
	},
	email: {
		type: String,
		unique: true,
		required: [true, 'Provide email'],
		validate: {
			validator: validator.isEmail,
			message: 'Provide valid email',
		},
	},
	password: {
		type: String,
		required: [true, 'Provide password'],
		minLength: 6,
	},
	role: {
		type: String,
		enum: [RoleEnum.ADMIN, RoleEnum.USER],
		default: RoleEnum.USER,
	},
})

UserSchema.pre('save', async function () {
	if (!this.isModified('password')) return
	const salt = await bcrypt.genSalt(10)
	this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.comparePassword = async function (str) {
	return await bcrypt.compare(str, this.password)
}

module.exports = mongoose.model('User', UserSchema)
