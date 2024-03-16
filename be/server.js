const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/convert-video', upload.single('video'), (req, res) => {
    const uploadedFile = req.file;
    if (!uploadedFile) {
        return res.status(400).send('No file uploaded.');
    }

    const inputFilePath = uploadedFile.originalname;
    const outputFilePath = inputFilePath.replace(/\.\w+$/, '-hd.mp4');
    ffmpeg(inputFilePath)
        .output(outputFilePath)
        .size('1920x1080')
        .on('error', (err) => {
            console.error('Error during conversion:', err);
            res.status(500).send('Error during conversion.');
        })
        .on('end', () => {
            console.log('Conversion complete.');
            res.download(outputFilePath, () => {
                // fs.unlinkSync(inputFilePath);
                fs.unlinkSync(outputFilePath);
            });
        })
        .run();
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
