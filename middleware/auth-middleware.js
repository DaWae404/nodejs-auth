const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader);
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided. Please log in to access this resource.'
        });
    }

    //decode the token
    try{
        const decodedTokenInfo = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log('Decoded Token Info:', decodedTokenInfo);

        req.userInfo = decodedTokenInfo; // Attach user info to the request object
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token. Please log in again.'
        });
    }


}

module.exports = authMiddleware;