const express = require('express')
const router = express.Router()

const fileUpload = require('express-fileupload')

const {
	authenticateUser,
	authorizePermissions,
} = require('../middleware/authentication')
const validateFile = require('../middleware/validate-file')

const {
	createProduct,
	getAllProducts,
	getSingleProduct,
	updateProduct,
	deleteProduct,
	uploadImage,
} = require('../controllers/productController')

const { getSingleProductReviews } = require('../controllers/reviewController')

const RoleEnum = require('../enums/role')

router
	.route('/')
	.get(getAllProducts)
	.post(authenticateUser, authorizePermissions(RoleEnum.ADMIN), createProduct)

router.route('/uploadImage').post(
	authenticateUser,
	authorizePermissions(RoleEnum.ADMIN),
	fileUpload({
		useTempFiles: true,
		limits: {
			fileSize: 1024 * 1024, // 1 MB
			files: 1,
		},
	}),
	validateFile,
	uploadImage,
)

router
	.route('/:id')
	.get(getSingleProduct)
	.patch(authenticateUser, authorizePermissions(RoleEnum.ADMIN), updateProduct)
	.delete(authenticateUser, authorizePermissions(RoleEnum.ADMIN), deleteProduct)

router.route('/:id/reviews').get(getSingleProductReviews)

module.exports = router
