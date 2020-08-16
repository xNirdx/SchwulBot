require('dotenv').config({ path: './config.env' });

const AWS = require('aws-sdk');
const download = require('image-downloader');
const fs = require('fs');
const readline = require('readline');

const Discord = require('discord.js');
const client = new Discord.Client();

class SchwulBot {
	constructor() {

	}

	colors = [
		0xE50000,
		0xFF8D00,
		0xFFEE00,
		0x008121,
		0x004CFF,
		0x760188
	]

	s3 = new AWS.S3();

	parse(message) {
		const messageContent = message.content.trim().toLowerCase();

		if (messageContent.startsWith(process.env.PREFIX)) {
			const stripped = messageContent.replace(process.env.PREFIX, '');
			const command  = stripped.substring(0, stripped.indexOf(' '));
			const args     = stripped.substring(stripped.indexOf(' '))
							 .trim().split(' ');

			const attachments = message.attachments;
			const category    = args.find(a => a == 'lesbian') ? 
			'lesbian' : 'gay';
			const isNsfw      = args.find(a => a == 'nsfw') ?
			true : false;

			/* if (command == 'upload') {
				this.upload({
					attachments: attachments,
					category: category,
					isNsfw: isNsfw
				});
			} else  */if (command == 'get') {
				this.getObject(message, {
					category: category,
					isNsfw: isNsfw,
					args: args
				});
			}
		}
	}

	async getObject(message, args) {
		const nsfw     = args["isNsfw"];
		const category = args["category"];
		const type     = (args["args"].find(a => a == "gif")) ? "gif" : "pic";

		let cache = [];
		let path = "./cache/";

		if (nsfw) {
			if (type == 'gif') {
				path += `nsfw-gif-${category}/cache.txt`;
			} else {
				path += `nsfw-pic-${category}/cache.txt`
			}
		} else {
			if (type == 'gif') {
				path += `gif-${category}/cache.txt`
			} else {
				path += `pic-${category}/cache.txt`
			}
		}

		const fileStream = fs.createReadStream(path);

		const rl = readline.createInterface({
		  input: fileStream,
		  crlfDelay: Infinity
		});

		for await (const line of rl) {
			cache.push(line);
		}

		const random_line = cache[Math.floor(Math.random() * cache.length)];

		this.s3.getSignedUrlPromise('getObject',
		{
			Bucket: "schwulbot",
			Key: random_line.toString()
		}/* , (err, data) => {
			if (err) {
				console.log(err.stack);
				return;
			}

			const file_type = data.ContentType.replace("image/", "");
			const att = new Discord.MessageAttachment(data.Body, `idk.${file_type}`);
			//message.channel.send(att);
			this.make_embed({
				type: 'normal',
				file: data.Body
			});

			message.channel.stopTyping();
		} */).then(url => {
			const u = url.substring(0, url.indexOf('AWSAccessKeyId') - 1).trim();
			this.make_embed({
				type: 'normal',
				file: u,
				message: message,
				path: path
			});
		}).catch(err => {
			console.log(err);
		});
	}

	isValidFileType(file) {
		return file.name.includes('.png') ||
			   file.name.includes('.jpg') ||
			   file.name.includes('.gif');
	}

	getFileType(file) {
		if (file.name.includes('.png')) {
			return 'png'
		} else if (file.name.includes('.jpg')) {
			return 'jpg'
		} else if (file.name.includes('.gif')) {
			return 'gif'
		}
	}


	make_embed(options) {
		const type    = options["type"];
		const color   = this.colors[Math.floor(Math.random() * this.colors.length)];
		const file    = options["file"];
		const message = options["message"];
		const path    = options["path"].substring(8, options["path"].length - 10);

		if (type == 'normal') {
			const embed = {
				author: {
					name: client.user.username,
					icon_url: client.user.displayAvatarURL()
				},
				title: path,
				description: 'Not working? Click the link above.',
				url: file,
				color: color,
				image: {
					url: file
				},
				footer: {
					text: `Requested by: ${message.author.username}`,
					icon_url: message.author.displayAvatarURL()
				}
			}

			message.channel.send({embed: embed});
		}
	}
}

const SB = new SchwulBot();

client.once('ready', () => {
	// set playing status
	client.user.setPresence({
		activity: { name: '🌈' },
		status: 'online'
	});

	// clear temp file storage every 5 minutes (300000 ms)
	setInterval(() => {
		fs.readdir('./temp', (err, files) => {
			if (files.length > 0) {
				for (let i = 0; i < files.length; i++) {
					fs.unlink(`./temp/${files[i].toString()}`, err => {
						if (err) console.log(err);
					});
				}
			}
		});
	}, 300000);

	console.log('SchwulBot running.');
});

client.on('message', (message) => {
	if (message.author.id != client.user.id) {
		SB.parse(message);
	}
});

client.login(process.env.BOT_TOKEN);
