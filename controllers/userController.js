const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const User = require('../models/User')
const {
	createTokenUser,
	attachCookiesToResponse,
	checkPermissions,
} = require('../utils')

const getAllUsers = async (req, res) => {
	const users = await User.find({ role: 'user' }).select('-password')
	res.status(StatusCodes.OK).json({ users })
}

const getSingleUser = async (req, res) => {
	const user = await User.findById(req.params.id).select('-password')

	if (!user) {
		throw new CustomError.NotFoundError(`No user with id ${req.params.id}`)
	}

	checkPermissions(req.user, user._id)

	res.status(StatusCodes.OK).json({ user })
}

const showCurrentUser = async (req, res) => {
	res.status(StatusCodes.OK).json({ user: req.user })
}

const updateUser = async (req, res) => {
	const { name, email } = req.body

	if (!name || !email) {
		throw new CustomError.BadRequestError('Provide name and email')
	}

	const user = await User.findById(req.user.userId)

	user.email = email
	user.name = name

	await user.save()

	const tokenUser = createTokenUser(user)
	attachCookiesToResponse({ res, user: tokenUser })

	res.status(StatusCodes.OK).json({ user: tokenUser })
}

const updateUserPassword = async (req, res) => {
	const { oldPassword, newPassword } = req.body

	if (!oldPassword || !newPassword) {
		throw new CustomError.BadRequestError('Provide current and new passwords')
	}

	const user = await User.findById(req.user.userId)

	if (!user) {
		throw new CustomError.NotFoundError(`No user with id ${req.user.userId}`)
	}

	const isPasswordCorrect = await user.comparePassword(oldPassword)
	if (!isPasswordCorrect) {
		throw new CustomError.BadRequestError('Invalid current password')
	}

	user.password = newPassword
	await user.save()

	res.status(StatusCodes.OK).json({ msg: 'Password successfully updated' })
}

module.exports = {
	getAllUsers,
	getSingleUser,
	showCurrentUser,
	updateUser,
	updateUserPassword,
}
