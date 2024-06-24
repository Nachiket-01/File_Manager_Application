const express = require('express');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const File = require('../models/File');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const storage = new Storage();
const bucket = storage.bucket('your-bucket-name');

router.post('/upload', upload.single('file'), async (req, res) => {
  const { file } = req;
  const blob = bucket.file(file.originalname);
  const blobStream = blob.createWriteStream();

  blobStream.on('error', (err) => {
    res.status(500).send(err);
  });

  blobStream.on('finish', async () => {
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    const newFile = new File({ name: file.originalname, url: publicUrl });
    await newFile.save();
    res.status(200).json({ file: newFile });
  });

  blobStream.end(req.file.buffer);
});

router.get('/files', async (req, res) => {
  const files = await File.find();
  res.json({ files });
});

module.exports = router;
