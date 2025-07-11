const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//register endpoint
const registerUser = async (req, res) => {
    try {
        //extracting the data from the request body
        const { username, email, password, role } = req.body;

        //check if the user already exists
        const checkExistingUser = await User.findOne({$or: [{username}, {email}]});
        if(checkExistingUser){
            return res.status(400).json({ 
                success: false,
                message: 'User already exists with this username or email.' });
        }

        //hashing the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //creating a new user
        const newlyCreatedUser = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        //saving the user to the database
        await newlyCreatedUser.save();

        if(newlyCreatedUser){
            return res.status(201).json({ 
                success: true,
                message: 'User registered successfully.' });
        }
        else{
            return res.status(400).json({ 
                success: false,
                message: 'User registration failed, please try again.' });
        }
    }
    catch(e){
        console.log(e);
        res.status(500).json({ 
            success: false,
            message: 'Internal Server Error, some error occurred. Please Try again.' });
    }
}

//login controller
const loginUser = async (req, res) => {
    try {
        const {username, password} = req.body;

        //find if the current user exists in database
        const user = await User.findOne({username});

        if(!user){
            return res.status(400).json({
                success: false,
                message: `User doesn't exist`
            })
        }

        //if the password is correct or not
        const isPasswordMatch = await bcrypt.compare(password, user.password)

        if(!isPasswordMatch){
            return res.status(400).json({
                success: false,
                message: 'Invalid username or password'
            })
        }

        //create user token
        const accessToken = jwt.sign({
            userId: user._id, 
            username: user.username,
            role: user.role
        }, process.env.JWT_SECRET_KEY, {
            expiresIn: '15m'
        })

        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            accessToken
        })


    }
    catch(e){
        console.log(e);
        res.status(500).json({ 
            success: false,
            message: 'Internal Server Error, some error occurred. Please Try again.' });
    }
}

const changePassword = async (req, res) => {
    try {
        const userId = req.userInfo.userId; // Extract userId from the authenticated user
        const { oldPassword, newPassword } = req.body;

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if the old password matches
        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: 'Old password is incorrect'
            });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(newPassword, salt);

        // Save the updated user
        user.password = newHashedPassword
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error, some error occurred. Please Try again.'
        });
    }

}

module.exports = { loginUser, registerUser, changePassword };