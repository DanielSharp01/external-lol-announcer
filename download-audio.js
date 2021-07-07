const fs = require("fs");
const path = require("path");
const https = require("https");

function downloadOgg(source) {
    const file = fs.createWriteStream(path.join(__dirname, `ogg/${source.name}.ogg`));
    https.get(source.content, function (response) {
        response.pipe(file);
        console.log('Downloaded', source);
    });
}

JSON.parse(fs.readFileSync('audio.json')).forEach(source => {
    downloadOgg(source)
});;