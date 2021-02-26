const video = document.getElementById("videoTag");
const chunks = [];

if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
  var stream = video.mozCaptureStream(60);
} else {
  var stream = video.captureStream(60);
}

const rec = new MediaRecorder(stream);

video.oncanplay = e => {
  rec.ondataavailable = e => chunks.push(e.data);
  rec.onstop = e => {
    stream.getTracks().forEach(stream => stream.stop());
    exportVid();
  };
  //video.play();
}

function recordMe() {
  rec.start();
}

(async() => {

  const mediaSource = new MediaSource();

  const urls = ["videos/birthday01.webm", "videos/birthday02.webm"];
  //const urls = ["videos/birthday01.webm"];

  const request = url => fetch(url).then(response => response.arrayBuffer());

  // `urls.reverse()` stops at `.currentTime` : `9`
  const files = await Promise.all(urls.map(request));

  /*
   `.webm` files
   Uncaught DOMException: Failed to execute 'appendBuffer' on 'SourceBuffer': This SourceBuffer has been removed from the parent media source.
   Uncaught DOMException: Failed to set the 'timestampOffset' property on 'SourceBuffer': This SourceBuffer has been removed from the parent media source.
  */
  const mimeCodec = 'video/webm; codecs="vp9,opus"';
  // https://stackoverflow.com/questions/14108536/how-do-i-append-two-video-files-data-to-a-source-buffer-using-media-source-api/
  //const mimeCodec = "video/mp4; codecs=avc1.42E01E, mp4a.40.2";


  const media = await Promise.all(files.map(file => {
    return new Promise(resolve => {
      let media = document.createElement("video");
      let blobURL = URL.createObjectURL(new Blob([file]));
      media.onloadedmetadata = async e => {
        resolve({
          mediaDuration: media.duration,
          mediaBuffer: file
        })
      }
      media.src = blobURL;
    })
  }));

  console.log(media);

  mediaSource.addEventListener("sourceopen", sourceOpen);

  video.src = URL.createObjectURL(mediaSource);

  async function sourceOpen(event) {

    if (MediaSource.isTypeSupported(mimeCodec)) {
      const sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);

      for (let chunk of media) {
        await new Promise(resolve => {
          sourceBuffer.appendBuffer(chunk.mediaBuffer);
          sourceBuffer.onupdateend = e => {
            sourceBuffer.onupdateend = null;
            sourceBuffer.timestampOffset += chunk.mediaDuration;
            console.log(mediaSource.duration);
            console.log(mediaSource);
            resolve()
          }
        })

      }

      mediaSource.endOfStream();
    }  
    else {
      console.warn(mimeCodec + " not supported");
    }
  }

})()

function exportVid() {
  const blob = new Blob(chunks);
  const url = URL.createObjectURL(blob);
  const vid = document.createElement('video');
  vid.src = url;
  vid.controls = true;
  // chrome duration workaround
  vid.play().then(() => {
    vid.currentTime = 10e99;
    vid.onseeked = () => {
      vid.currentTime = 0;
      vid.pause();
      vid.onseeked = null;
    }
  });
  document.body.appendChild(vid);
}    

