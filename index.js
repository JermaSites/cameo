var ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
let express = require('express');
const app = express();
// var cors = require('cors')
// app.use(cors())

app.get('/api/', (req, res) => {
  ffmpeg('videos/names/miranda.mp4')
    .input('videos/and.mp4')
    .input('videos/names/miranda.mp4')
    .on('error', function(err) {
      console.log('An error occurred: ' + err.message);
    })
    .on('end', function() {
      var base64video = fs.readFileSync('videos/out.mp4', {encoding: 'base64'});
      const returnVideo = Buffer.from(base64video, 'base64');
      res.setHeader('Content-Type', 'video/mp4');    
      res.setHeader('Content-Length', returnVideo.length);
      res.writeHead(200);
      res.end(returnVideo); 
      try {
        fs.unlinkSync('videos/out.mp4');
        //file removed
      } catch(err) {
        console.error(err);
      }
      return;
    })
    .mergeToFile('videos/out.mp4', 'videos');
  });

app.listen((process.env.PORT || 5000), () =>
  console.log('api listening on port 5000 (probably)!'),
);