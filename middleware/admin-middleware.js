

const isAdminUser = (req, res, next) => {
    if(req.user && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. You do not have permission to access this resource. Admin privileges are required.'
        });
    }
    next();
}

module.exports = isAdminUser;