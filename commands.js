const fs = require('fs');
const { Random } = require('random-js');
const Discord = require('discord.js');
const get = require('get');

exports.get_asset = (type, msg, style, nsfw) => {
    let yerp = "";

    if (nsfw) {
        yerp = "nsfw"
    } else {
        yerp = "sfw"
    }

    fs.readFile('./repository/' + type + 's/' + yerp + '/' + style + '/all-' + type + 's.txt', (err, data) => {
        if (err) console.log(err);
        let yikes = data.toString().split("\n");

        let r = new Random();
        let our_asset = yikes[r.integer(0, yikes.length - 1)];

        let our_embed = "";

        if (style === 'gay') {
            our_embed = new Discord.MessageEmbed().setImage(our_asset).setFooter("Imagery provided by Leevi (probably)",
                'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Heart_corazón.svg/1200px-Heart_corazón.svg.png')
                .setTitle("Save " + type + " ⏬")
                .setURL(our_asset);
        } else {
            our_embed = new Discord.MessageEmbed()
                .setImage(our_asset)
                .setTitle("Save " + type + " ⏬")
                .setURL(our_asset);
        }

        console.log(our_asset);

        msg.channel.send(our_embed);
    });
}
