// requires
const AWS = require('aws-sdk');
const fs = require('fs');

const settings = {
    category: (process.argv[2] ? process.argv[2] : 'all'),
    num_categories: 2
}

const s3 = new AWS.S3();

function upload(options) {
    const params = {
        Body: options.fileData,
        Bucket: 'schwulbot',
        Key: `${options.key}/${options.file}`,
        ContentType: `image/${getFileType(options.file)}`,
        ACL: 'public-read'
    }

    s3.putObject(params, (err, data) => {
        if (err) console.log(err);
        console.log(data);
    });
}

function getFileType(file) {
    const gif = (file.includes('.gif') ? 'gif' : false);
    const jpg = (file.includes('.jpg') ? 'jpg' : false);
    const png = (file.includes('.png') ? 'png' : false);

    return gif || jpg || png;
}

function gifOrPic(file) {
    if (getFileType(file) == 'gif') {
        return 'gif';
    } else {
        return 'pic';
    }
}

function getFiles(dir) {
    fs.readdir(dir, (err, ratings) => {
        if (err) console.log(err);

        for (let rating of ratings) {
            const type = (rating == 'nsfw') ? 'nsfw-' : '';

            fs.readdir(`${dir}/${rating}`, (err, files) => {
                if (err) console.log(err);
                
                for (let file of files) {
                    fs.readFile(`${dir}/${rating}/${file}`, (err, fileData) => {
                        if (err) console.log(err);

                        upload({
                            file: file,
                            fileData: fileData,
                            key: `${type}${gifOrPic(file)}-${settings.category}`
                        });

                        fs.appendFile(`./cache/${type}${gifOrPic(file)}-${settings.category}/cache.txt`, `\n${type}${gifOrPic(file)}-${settings.category}/${file}`, (err) => {
                            if (err) console.log(err);
                        });
                    });
                }
            });
        }
    });
}

if (settings.category != 'all') {
    // if a category is explicitly given, get the files from it
    getFiles(`./upload/${settings.category}`);
} else {
    // no category was provided
    console.warn("Please provide a category.");
}