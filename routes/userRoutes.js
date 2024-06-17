const express = require('express')
const router = express.Router()

const RoleEnum = require('../enums/role')
const { authorizePermissions } = require('../middleware/authentication')
const {
	getAllUsers,
	getSingleUser,
	showCurrentUser,
	updateUser,
	updateUserPassword,
} = require('../controllers/userController')

router.route('/').get(authorizePermissions(RoleEnum.ADMIN), getAllUsers)

router.route('/me').get(showCurrentUser)

router.route('/update').patch(updateUser)
router.route('/updatePassword').patch(updateUserPassword)

router.route('/:id').get(getSingleUser)

// todo: implement delete user account functionality

module.exports = router
