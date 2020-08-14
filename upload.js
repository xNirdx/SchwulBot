require('dotenv').config({ path: './upload-config.env' });

// requires
const AWS = require('aws-sdk');
const fs = require('fs');

// paths to folders
const gay     = process.env.GAY_DIR;
const lesbian = process.env.LESBIAN_DIR;

// read directories
console.log("Reading directories...");

function upload(options) {
    const bucket = '';
    const object = options['object'];
    const type   = getFileType(object);

    fs.readFile(options['path'], (err, data) => {
        if (err) console.log(err);
        else console.log(data);
    });
}

function getFileType(object) {
    const gif = object.includes('.gif') ? 'gif' : false;
    const jpg = object.includes('.jpg') ? 'jpg' : false;
    const png = object.includes('.png') ? 'png' : false;

    return gif || jpg || png;
}

fs.readdir(gay, (err, files) => {
    const hasNsfw = files.find(file => file == 'nsfw');
    const hasSfw  = files.find(file => file == 'sfw');

    // does the folder have nsfw and sfw subfolders?
    if (hasNsfw != undefined && hasSfw != undefined) {
        // it does, continue

        // read each subfolder (nsfw and sfw folders)
        for (let i = 0; i < files.length; i++) {
            const pwd = `${gay}/${files[i]}`;

            // get files
            fs.readdir(pwd, (err, objects) => {
                if (err) console.log(err);
                
                for (let j = 0; j < objects.length; j++) {
                    const type = getFileType(objects[j]);

                    upload({
                        object: objects[j],
                        path: `${gay}/${files[i]}/${objects[j]}`
                    });
                }
            });
        }
    } else {
        // it does not, do not continue
        console.log("Subfolders [nsfw] and [sfw] are missing!");
    }
});