const { BadRequestError } = require('../errors/index')

const validateFile = async (req, res, next) => {
	if (!req.files) {
		throw new BadRequestError('Image was not provided')
	}

	const image = req.files.image

	if (image.truncated) {
		// file size > 1 MB
		throw new BadRequestError('Image size exceeds limit of 1 MB')
	}

	if (!image.mimetype.startsWith('image')) {
		throw new BadRequestError('Unsupported image type')
	}

	next()
}

module.exports = validateFile
