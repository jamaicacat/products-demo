const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { createTokenUser, attachCookiesToResponse } = require('../utils')
const RoleEnum = require('../enums/role')

const User = require('../models/User')

const register = async (req, res) => {
	const { email, name, password } = req.body

	const emailAlreadyExists = await User.findOne({ email })
	if (emailAlreadyExists) {
		throw new CustomError.BadRequestError('Email already exists')
	}

	// first registered user is an admin
	const isFirstUser = (await User.countDocuments({})) === 0
	const role = isFirstUser ? RoleEnum.ADMIN : RoleEnum.USER

	const user = await User.create({ email, name, password, role })
	const tokenUser = createTokenUser(user)

	attachCookiesToResponse({ res, user: tokenUser })
	res.status(StatusCodes.CREATED).json({ user: tokenUser })
}

const login = async (req, res) => {
	const { email, password } = req.body

	if (!email || !password) {
		throw new CustomError.BadRequestError('Provide email and password')
	}

	const user = await User.findOne({ email })

	if (!user) {
		throw new CustomError.UnauthenticatedError('Invalid credentials')
	}

	const passwordMatch = await user.comparePassword(password)

	if (!passwordMatch) {
		throw new CustomError.UnauthenticatedError('Incorrect password')
	}

	const tokenUser = createTokenUser(user)

	attachCookiesToResponse({
		res,
		user: tokenUser,
	})
	res.status(StatusCodes.OK).json({ tokenUser })
}

const logout = async (req, res) => {
	res.cookie('token', 'logout', {
		httpOnly: true,
		expires: new Date(Date.now()),
	})
	res.status(StatusCodes.OK).end()
}

module.exports = {
	register,
	login,
	logout,
}
