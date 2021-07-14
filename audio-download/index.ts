import fs from 'fs';
import path from 'path';
import https from 'https';

process.exit(0);

function downloadOgg(source) {
    const file = fs.createWriteStream(path.join(__dirname, `ogg/${source.name}.ogg`));
    https.get(source.content, function (response) {
        response.pipe(file);
        console.log('Downloaded', source);
    });
}

JSON.parse(fs.readFileSync('audio.json', 'utf-8')).forEach(source => {
    downloadOgg(source)
});;