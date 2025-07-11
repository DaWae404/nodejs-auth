const Image = require('../models/image');
const {uploadToCloudinary} = require('../helpers/cloudinaryHelper');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

const uploadImageController = async (req, res) => {
    try{

        //check if file is missing in request
        if(!req.file){
            return res.status(400).json({ 
                success: false,
                message: 'No file uploaded. Please upload an image file.' 
            });
        }

        //upload image to cloudinary
        const {url, publicId} = await uploadToCloudinary(req.file.path);

        //save image details to database
        const newlyUploadedImage = new Image({
            url,
            publicId,
            uploadedBy: req.userInfo.userId // assuming req.user is set by authentication middleware
        });
        
        await newlyUploadedImage.save();

        //delete the file from local storage after uploading to cloudinary
        fs.unlinkSync(req.file.path);

        return res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            image: newlyUploadedImage
        });
    }
    catch(error){
        console.error('Error uploading image:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const fetchImagesController = async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1; // default to page 1
        const limit = parseInt(req.query.limit) || 5; // default to 10 images per page
        const skip = (page - 1) * limit;

        const sortBy = req.query.sortBy || 'createdAt'; // default sort by createdAt
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1; // default to descending order
        const totalImages = await Image.countDocuments();
        const totalPages = Math.ceil(totalImages / limit);

        const sortObj = {};
        sortObj[sortBy] = sortOrder;
        const images = await Image.find().sort(sortObj).skip(skip).limit(limit);

        if(images){
            return res.status(200).json({
                success: true,
                message: 'Images fetched successfully',
                currentPage: page,
                totalPages: totalPages,
                totalImages: totalImages,
                data: images
            });
        }
    }


    catch(error){
        console.error('Error fetching images:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error' });
    }
}

const deleteImageController = async (req, res) => {
    try{
        const getCurrentIdOfImageToBeDeleted = req.params.id;
        const userId = req.userInfo.userId; // assuming req.userInfo is set by authentication middleware

        const image = await Image.findById(getCurrentIdOfImageToBeDeleted);
        if(!image){
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }
        // Check if the user is authorized to delete this image
        if(image.uploadedBy.toString() !== userId){
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this image'
            });
        }

        // Delete the image from Cloudinary
        await cloudinary.uploader.destroy(image.publicId);

        // Delete the image record from the mongodb database
        await Image.findByIdAndDelete(getCurrentIdOfImageToBeDeleted);

        return res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        });

    }
    catch(error){
    console.error(error);
    return res.status(500).json({ 
        success: false,
        message: 'Internal server error' });
    }

}

module.exports = {
    uploadImageController,
    fetchImagesController,
    deleteImageController
};