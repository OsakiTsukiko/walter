const DiscordJS = require('discord.js');
const fs = require('fs');

const conf = require("./conf.json");

module.exports = {
    // Utils
    anarchy_check: function (self_pos, anarchy_check) {
        let b_pos = { // bigger pos
            x: Math.max(anarchy_check.pos1.x, anarchy_check.pos2.x),
            z: Math.max(anarchy_check.pos1.z, anarchy_check.pos2.z)
        };

        let s_pos = { // smaller pos
            x: Math.min(anarchy_check.pos1.x, anarchy_check.pos2.x),
            z: Math.min(anarchy_check.pos1.z, anarchy_check.pos2.z)
        };

        if ( self_pos.x >= s_pos.x && self_pos.x <= b_pos.x && self_pos.z >= s_pos.z && self_pos.z <= b_pos.z ) {
            return true;
        }

        return false;
    },

    // Dicord
    chatBridgeMSGEmbeed: function (author, content, color, serverIp) {
        return new DiscordJS.EmbedBuilder()
        .setColor(color)
        .setAuthor({
            name: author, 
            iconURL: 'https://cravatar.eu/helmhead/' + author
        })
        .addFields({
            name: "Message", 
            value: '```' + content + '```'
        })
        .setTimestamp()
        .setFooter({text: serverIp});
    },

    chatBridgeDiscordEmbeed: function (author, content, color, channel_name) {
        return new DiscordJS.EmbedBuilder()
        .setColor(color)
        .setAuthor({
            name: author.username, 
            iconURL: author.displayAvatarURL() + "?size=512"
        })
        .addFields({
            name: "Discord Message", 
            value: '```' + content + '```'
        })
        .setTimestamp()
        .setFooter({text: "#" + channel_name});
    },

    // File Handler
    initFileHandler: function () {
        let save_dir = "./" + conf.bot.save.save_dir;
        if (!fs.existsSync(save_dir)){
            fs.mkdirSync(save_dir);
        }

        if (!fs.existsSync(save_dir + "/chat_logs.txt")) {
            fs.writeFileSync(save_dir + "/chat_logs.txt", "Init!\n\n");
        }
    },
    
    chat_log: function (msg) {
        let save_dir = "./" + conf.bot.save.save_dir;
        const d = new Date();
        let date = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear() + ":" + d.getHours() + "-" + d.getMinutes() + "-" + d.getSeconds();
        fs.writeFileSync(
            save_dir + "/chat_logs.txt", 
            fs.readFileSync(save_dir + "/chat_logs.txt", "utf8") + "<" + date + "> " + msg + "\n\n"
            );
    }

}