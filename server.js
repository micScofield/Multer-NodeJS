const express = require('express')
const { upload } = require('./multer-storage/multer-storage-config')

const app = express()

//Follow this exact syntax to setup EJS
app.set('view engine', 'ejs')

//Public Folder
app.use(express.static('./public'))

app.get('/', (req, res) => {
    // res.status(200).json({msg: 'Hello World'})

    //To render using EJS:-
    res.render('index')
})

app.post('/upload', (req, res) => {
    //This is the route we passed to action tag inside form
    upload(req, res, (err) => {
        if (err) res.render('index', { msg: err }) //we specified msg variable inside EJS error handling
        else {
            // console.log(req.file) to see what fields we receive
            if (req.file === undefined) res.render('index', { msg: 'Please select an image !' })
            else {
                res.render('index', {
                    msg: 'File Uploaded !', 
                    file: `uploads/${req.file.filename}`
                })
            }
        }
    })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))