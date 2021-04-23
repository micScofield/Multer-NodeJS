const path = require('path')

const checkFileType = (file, cb) => {
    //1. check extension (naive approach)
    //2. Check mime-type (Better Practice)

    const fileTypes = /jpeg|jpg|png|gif/

    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = fileTypes.test(file.mimetype)
    
    if (extname && mimetype) {
        return cb(null, true) //null as error and true as check passed
    } else {
        return cb('Error: Images Only !')
    }
}

module.exports.checkFileType = checkFileType