const multer = require('multer')
const path = require('path')

const { checkFileType } = require('../utility/checkFileType')

//Set Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
})

//Init Upload 
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, //specify file size in bytes
    fileFilter: (res, file, cb) => checkFileType(file, cb)
}).single('myImage'); //For multiple use arrays, pass fieldname(s)

module.exports.upload = upload