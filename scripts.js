function slideOut() {
  document.getElementById("start-page").classList.add("slideOut");
  document.getElementById("request-page").style.display = "flex";
  document.getElementById("request-page").classList.add("slideIn");
  document.getElementById("fake-box").style.pointerEvents = "revert";
  if(document.getElementById("type").value === "anniversary") {
    document.getElementById("name2selector").style.display = "revert";
  } else {
    document.getElementById("name2selector").style.display = "none";
  }

  // document.getElementById("type").value = "";
	// document.getElementById("name1").value = "";
	// document.getElementById("name2").value = "";
  evaluateMedia();
}

var keyframes = "@keyframes slideJS {0% {transform: translate(0px);}50% {transform: translate(-" + (document.getElementById("sliding-background").offsetWidth - Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)) + "px);}100% {transform: translate(0px);}}"; //congrats!! you found the ugliest line of code in this whole project!!!
//this is a just a thing so that the background never overflows
//its awful i know 
var s = document.createElement( 'style' );
s.innerHTML = keyframes;
document.head.appendChild(s);

document.getElementById("sliding-background").style.animationName = "slideJS";
document.getElementById("sliding-background").style.animationDuration = "120s";
document.getElementById("sliding-background").style.animationTimingFunction = "linear";
document.getElementById("sliding-background").style.animationIterationCount = "infinite";

const names = ["bernie.webm","angus.webm","david.webm","josephine.webm","kennedy.webm","luna.webm","nick.webm","xavier.webm","yusef.webm","zachary.webm","alice.webm","alec.webm","alex.webm","alexander.webm","amy.webm","andrew.webm","andy.webm","anthony.webm","arthur.webm","ava.webm","avery.webm","becca.webm","benjamin.webm","briana.webm","brooklyn.webm","caiden.webm","caitlyn.webm","carter.webm","case.webm","catherine.webm","charlotte.webm","client.webm","cody.webm","colton.webm","crystal.webm","daniel.webm","darrell.webm","dave.webm","davy.webm","delia.webm","delilah.webm","ed.webm","eddie.webm","edward.webm","elijah.webm","emily.webm","emma.webm","evan.webm","faith.webm","finn.webm","fredrick.webm","gary.webm","goku.webm","grace.webm","grayson.webm","greg.webm","harper.webm","henry.webm","isabella.webm","issac.webm","jeremy.webm","jerry.webm","jesse.webm","joe.webm","john.webm","joseph.webm","josh.webm","joshua.webm","julie.webm","keith.webm","kyle.webm","lauren.webm","laurence.webm","liam.webm","lilly.webm","logan.webm","louis.webm","luke.webm","mark.webm","mason.webm","matt.webm","matthew.webm","mia.webm","mike.webm","miranda.webm","natalie.webm","noah.webm","norah.webm","oliver.webm","olivia.webm","otto.webm","parker.webm","peter.webm","preston.webm","quinn.webm","riley.webm","rosie.webm","ryan.webm","sebastian.webm","sidney.webm","sophia.webm","steve.webm","steven.webm","taylor.webm","thanos.webm","theodore.webm","tiffany.webm","trevor.webm","tyler.webm","unique.webm","uriel.webm","vanellope.webm","victor.webm","victoria.webm","vincent.webm","william.webm","willow.webm","yuritzi.webm","zain.webm","zimena.webm","zoe.webm"].sort();
const heyNames = ["bernie.webm","angus.webm","david.webm","josephine.webm","kennedy.webm","luna.webm","nick.webm","paul.webm","xavier.webm","yusef.webm","zachary.webm"];

// This stuff is used to generate the above arrays using brfs and browserify
// const fs = require('fs');
// const names = fs.readdirSync('videos/names').sort();
// const heyNames = fs.readdirSync('videos/names/hey');


const capitalize = (s) => { //stolen from https://flaviocopes.com/how-to-uppercase-first-letter-javascript/
	if (typeof s !== 'string') return ''
	return s.charAt(0).toUpperCase() + s.slice(1)
}

for(var i = 0; i < names.length; i++) {
	var nameWithoutExtension = names[i].split('.').slice(0, -1).join('.');
	var newOption = document.createElement("option");
	newOption.value = nameWithoutExtension;
	newOption.innerHTML = capitalize(nameWithoutExtension);
	document.getElementById("name1").appendChild(newOption);
}

for(var i = 0; i < names.length; i++) {
	var nameWithoutExtension = names[i].split('.').slice(0, -1).join('.');
	var newOption = document.createElement("option");
	newOption.value = nameWithoutExtension;
	newOption.innerHTML = capitalize(nameWithoutExtension);
	document.getElementById("name2").appendChild(newOption); //apparently you cant just append an object to multiple elements
}


async function generateMedia(urls) { //https://stackoverflow.com/a/57652610

	const mediaSource = new MediaSource();

	const video = document.querySelector("video");

	const request = url => fetch(url).then(response => response.arrayBuffer());

	const files = await Promise.all(urls.map(request));

	const mimeCodec = 'video/webm; codecs="vp9,opus"'; //https://stackoverflow.com/questions/14108536/how-do-i-append-two-video-files-data-to-a-source-buffer-using-media-source-api/

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
	video.style.display = "revert";

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

  }

function evaluateMedia() {
  const video = document.querySelector("video");
  video.src = "";

	type = document.getElementById("type").value;
	name1 = document.getElementById("name1").value;
	name2 = document.getElementById("name2").value;
  
	if (type != "" && name1 != "") {
		var clips = new Array();
		switch (type) {
			case "anniversary":
        document.getElementById("name2selector").style.display = "revert";
        if(name2 != "") {
          if (heyNames.includes(name1 + '.webm')) { //we always want anniversary videos to start with "hey" if we can
            clips.push("videos/names/hey/" + name1 + ".webm"); //rather than stripping every single file name in the array of the phrase ".webm", lets just compare with .webm added
            clips.push("videos/and.webm");
            clips.push("videos/names/" + name2 + ".webm");
          } else if (heyNames.includes(name2 + '.webm')) {
            clips.push("videos/names/hey/" + name2 + ".webm");
            clips.push("videos/and.webm");
            clips.push("videos/names/" + name1 + ".webm");
          } else {
            clips.push("videos/names/" + name1 + ".webm");
            clips.push("videos/and.webm");
            clips.push("videos/names/" + name2 + ".webm");
          }
          clips.push("videos/anniversary.webm");
        }
				break;

			case "birthday_type01":
        document.getElementById("name2selector").style.display = "none";
        document.getElementById("name2").value = "";
				clips.push("videos/birthday_type01_01.webm");
				clips.push("videos/names/" + name1 + ".webm");
				clips.push("videos/birthday_type01_02.webm");
				clips.push("videos/names/" + name1 + ".webm");
				clips.push("videos/birthday_type01_03.webm");
				break;
			
			case "birthday_type02":
        document.getElementById("name2selector").style.display = "none";
        document.getElementById("name2").value = "";
				clips.push("videos/birthday_type02_01.webm");
				clips.push("videos/names/" + name1 + ".webm");
				clips.push("videos/birthday_type02_02.webm");
				clips.push("videos/names/" + name1 + ".webm");
				clips.push("videos/birthday_type02_03.webm");
				break;
		}
		generateMedia(clips);
	}
}

function closebox() {
  document.getElementById("about").style.display = "none";
}

function about() {
  document.getElementById("about").style.display = "flex";
}