const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath);
        return {
            url: result.secure_url,
            publicId: result.public_id,
        };
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw new Error('Error uploading to Cloudinary');
    }
}

module.exports = {
    uploadToCloudinary,
};
// This helper function uploads files to Cloudinary and returns the URL and public ID of the uploaded file.
// It uses the Cloudinary SDK to handle the upload process and includes error handling to catch any