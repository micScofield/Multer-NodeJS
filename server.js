const path = require('path')
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const { upload } = require('./multer-storage/multer-storage-config')
const PDFDocument = require('pdfkit')
const mongoose = require('mongoose')
require('dotenv').config()

// Image Model
const Image = require('./models/image')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))

//Follow this exact syntax to setup EJS
app.set('view engine', 'ejs')

//Public Folder
app.use(express.static('./public'))

app.get('/', async (req, res) => {
    // res.status(200).json({msg: 'Hello World'})

    // reversing the search results
    const images = await Image.find({}).sort({ _id: -1 })

    //To render using EJS:-
    res.render('index2', { files: images })
})

app.get('/invoice/:param', (req, res) => {
    /*
        Steps 1. Fetch some parameter and find related details from the database which is required in invoice
        2. Set invoice name
        3. Set invoice path
        4. Set response header to application/pdf
        5. See documentation for various properties
    */
    const id = req.params.param
    const invoiceName = 'invoice-' + id + '.pdf'
    const invoicePath = path.join('data', 'invoices', invoiceName)

    const pdfDoc = new PDFDocument()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline filename="${invoiceName}"`)

    pdfDoc.pipe(fs.createWriteStream(invoicePath))

    pdfDoc.pipe(res) // res object is a writable object so we can pipe the result to this

    pdfDoc.fontSize(26).text('Invoice', {
        underline: true
    })
    pdfDoc.fontSize(16).text('Some Dummy Invoice Data')

    const pathToImage = path.join(__dirname, 'public', req.query.path)

    pdfDoc.image(pathToImage, {
        fit: [250, 300],
        align: 'center',
        valign: 'center'
    })

    pdfDoc
        .addPage()
        .fillColor('blue')
        .text('Here is a link!', 100, 100)
        .underline(100, 100, 160, 27, { color: '#0000FF' })
        .link(100, 100, 160, 27, 'http://google.com/');
    pdfDoc.end()
})

//This is the route we passed to action tag inside form
app.post('/upload', (req, res) => {
    upload(req, res, async (err) => {
        if (err) res.render('index', { msg: err }) //we specified msg variable inside EJS error handling
        else {
            if (req.file === undefined) res.render('index', { msg: 'Please select an image !' })
            else {
                console.log(req.file)

                // Store in DB if necessary and clear from filesystem
                const imageObj = new Image({
                    name: req.file.filename,
                    desc: 'Profile Image',
                    img: {
                        data: fs.readFileSync(path.join(__dirname + '/public/uploads/' + req.file.filename)),
                        contentType: 'image/png'
                    }
                })

                const savedRes = await imageObj.save()
                console.log(savedRes)

                res.render('index2', {
                    msg: 'File Uploaded !',
                    file: `uploads/${req.file.filename}`
                    // file: savedRes.img // do base64 encoding in view if you dont need above field
                })
            }
        }
    })
})

const PORT = process.env.PORT || 5000

const connectDB = async (req, res, next) => {
    try {
        await mongoose.connect(
            process.env.MONGO_URI, 
            {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false}, 
            console.log('db connected')
        )
    } catch (error) {
        console.log('Connection to DB failed')
    }
}

connectDB()

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))