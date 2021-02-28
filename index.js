const fs = require('fs');
const express = require('express');
const app = express();
const videoStitch = require('video-stitch');
const videoConcat = videoStitch.concat;

const cors = require('cors');
app.use(cors());

//startup stuff for reading directories and storing them lol
const names = fs.readdirSync('videos/names');
const heyNames = fs.readdirSync('videos/names/hey');

var serveDir = "./serve";
if (!fs.existsSync(serveDir)){
	fs.mkdirSync(serveDir);
}

app.get('/', (req, res) => {
	var clips = new Array();
	var outputNameAsString = [req.query.type, req.query.name1, req.query.name2].filter(Boolean).join("_") + ".webm"; //we use .filter and .join instead of concatenate because name2 might not always exist
	
	console.log(outputNameAsString);

	const varServedFiles = fs.readdirSync(serveDir);

	if(varServedFiles.includes(outputNameAsString)) {
		console.log("found video " + outputNameAsString + " in cache, serving");
		res.set("Content-Disposition", "attachment;filename=" + outputNameAsString);
		res.attachment(outputNameAsString);
		res.sendFile(outputNameAsString, {
			root: __dirname
		});
	} else {

		switch (req.query.type) {
			case "anniversary":
				if (heyNames.includes(req.query.name1 + '.webm')) { //we always want anniversary videos to start with "hey" if we can
					clips.push({"fileName": "videos/names/hey/" + req.query.name1 + ".webm"}); //rather than stripping every single file name in the array of the phrase ".webm", lets just compare with .webm added
					clips.push({"fileName": "videos/and.webm"});
					clips.push({"fileName": "videos/names/" + req.query.name2 + ".webm"});
				} else if (heyNames.includes(req.query.name2 + '.webm')) {
					clips.push({"fileName": "videos/names/hey/" + req.query.name2 + ".webm"});
					clips.push({"fileName": "videos/and.webm"});
					clips.push({"fileName": "videos/names/" + req.query.name1 + ".webm"});
				} else {
					clips.push({"fileName": "videos/names/" + req.query.name1 + ".webm"});
					clips.push({"fileName": "videos/and.webm"});
					clips.push({"fileName": "videos/names/" + req.query.name2 + ".webm"});
				}
				clips.push({"fileName": "videos/anniversary.webm"});
				break;

			case "birthday_type01":
				clips.push({"fileName": "videos/birthday_type01_01.webm"});
				clips.push({"fileName": "videos/names/" + req.query.name1 + ".webm"});
				clips.push({"fileName": "videos/birthday_type01_02.webm"});
				clips.push({"fileName": "videos/names/" + req.query.name1 + ".webm"});
				clips.push({"fileName": "videos/birthday_type01_03.webm"});
				break;
			
			case "birthday_type02":
				clips.push({"fileName": "videos/birthday_type02_01.webm"});
				clips.push({"fileName": "videos/names/" + req.query.name1 + ".webm"});
				clips.push({"fileName": "videos/birthday_type02_02.webm"});
				clips.push({"fileName": "videos/names/" + req.query.name1 + ".webm"});
				clips.push({"fileName": "videos/birthday_type02_03.webm"});
				break;
		}

		// console.log(clips);
		console.log("producing new video " + outputNameAsString);
		
		// FFMpeg doesn't like relative urls, especially in 3rd-party modules, so we'll convert them to absolute instead
		clips = clips.map(i => {
			return {
				i.fileName = __dirname + "/" + i.fileName;
				return i;
			};	
		});
		
		videoConcat({
			silent: true, // if set to false, gives detailed output on console
			overwrite: true //lets keep this at true just on the off chance that checking if the file exists fails
		})
		.clips(clips)
		.output("serve/" + outputNameAsString)
		.concat()
		.then((outputFileName) => {
			console.log("produced new video " + outputNameAsString);
			res.set("Content-Disposition", "attachment;filename=" + outputFileName);
			res.attachment(outputFileName);
			res.sendFile(outputFileName, {
				root: __dirname
			});
		});
	}
});

app.listen((process.env.PORT || 5000), () =>
	console.log('api listening on port 5000 (probably)!'),
);
