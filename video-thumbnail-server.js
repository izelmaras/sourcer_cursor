const express = require('express');
const fetch = require('node-fetch');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 4000;

app.get('/thumbnail', async (req, res) => {
  const { url, t = 1 } = req.query;
  if (!url) return res.status(400).send('Missing url param');

  const tempVideo = path.join(__dirname, `${uuidv4()}.mp4`);
  const tempImage = path.join(__dirname, `${uuidv4()}.jpg`);

  try {
    // Download video
    const response = await fetch(url);
    const fileStream = fs.createWriteStream(tempVideo);
    await new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on('error', reject);
      fileStream.on('finish', resolve);
    });

    // Extract thumbnail
    await new Promise((resolve, reject) => {
      ffmpeg(tempVideo)
        .screenshots({
          timestamps: [t],
          filename: path.basename(tempImage),
          folder: path.dirname(tempImage),
          size: '640x?'
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Send image
    res.sendFile(tempImage, () => {
      fs.unlinkSync(tempVideo);
      fs.unlinkSync(tempImage);
    });
  } catch (err) {
    if (fs.existsSync(tempVideo)) fs.unlinkSync(tempVideo);
    if (fs.existsSync(tempImage)) fs.unlinkSync(tempImage);
    res.status(500).send('Failed to generate thumbnail');
  }
});

app.listen(PORT, () => {
  console.log(`Thumbnail server running on http://localhost:${PORT}`);
}); 