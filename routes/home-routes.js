const express = require('express');
const authMiddleware = require('../middleware/auth-middleware');
const router = express.Router();

router.get('/welcome', authMiddleware, (req,res)=>{
    const {username, userId, role} = req.user; // Extract user info from the request object
    res.json({
        message: 'Welcome to the home page',
        user: {
            username: username,
            userId: userId,
            role: role
        }
    })
});

module.exports = router

