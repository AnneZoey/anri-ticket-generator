const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000; 

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'temp')));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({
                status: false,
                message: 'No file is selected.'
            });
        }
    
        const text = req.body.text;
        const uploadedImage = req.file.buffer;

        const overlayedImageBuffer = await overlay(uploadedImage, text);
        const fileName = `${text}_ticket.png`;
        const filePath = path.join(__dirname, 'temp', fileName);
        fs.writeFileSync(filePath, overlayedImageBuffer);

        res.download(filePath, fileName, (err) => {
            if (err) {
                console.log(err);
            } else {
                fs.unlinkSync(filePath);
            }
        });
    
    } catch (err) {
        console.log(err);
    }

});

async function overlay(imageBuffer, text) {
    const baseImage = sharp(path.join(__dirname, 'views', 'default.png'));
    const uploadedImageBuffer = resizeAndRoundCorner(imageBuffer);
    const overlayedBuffer = await baseImage
    .composite([
        {
            input: await uploadedImageBuffer,
            top: 218,
            left: 856
        },
        {
            input: Buffer.from(`<svg width="400" height="100" xmlns="http://www.w3.org/2000/svg"><text x="10" y="40" font-family="Anton" font-size="40" fill="white">${text}</text></svg>`),
            top: 277,
            left: 1038
        },
    ])
    .png()
    .toBuffer();
    return overlayedBuffer;
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

async function resizeAndRoundCorner(imageBuffer) {
    const roundCornerMask = Buffer.from('<svg><rect x="0" y="0" height="163" width="163" rx="10" ry="10"/></svg>');
    const resizedImageBuffer = await sharp(imageBuffer)
    .resize(163, 163)
    .png()
    .toBuffer();
    const roundedCornerImageBuffer = await sharp(resizedImageBuffer)
    .composite([
        {
            input: roundCornerMask,
            blend: 'dest-in'
        }
    ])
    .png()
    .toBuffer();
    return roundedCornerImageBuffer;
}