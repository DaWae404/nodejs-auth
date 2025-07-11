const multer = require('multer');
const path = require('path');

// Set up storage engine for multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');// specify the upload directory
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // append the file extension
    }
});

//file filter function
const checkFileFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith('image')) {
        cb(null, true); // accept the file
    } else {
        cb(new Error('Not an image file!')); // reject the file
    }
}

//multer middleware
module.exports = multer({
    storage: storage,
    fileFilter: checkFileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5 MB file size limit
    }
});
