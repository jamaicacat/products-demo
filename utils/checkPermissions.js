const CustomError = require('../errors/')
const RoleEnum = require('../enums/role')

const checkPermissions = (requestUser, resourceUserId) => {
	if (requestUser.role === RoleEnum.ADMIN) return
	if (requestUser.userId === resourceUserId.toString()) return
	throw new CustomError.UnauthorizedError('Not authorized to access this route')
}

module.exports = checkPermissions
