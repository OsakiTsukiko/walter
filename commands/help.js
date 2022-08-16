const { Command } = require('../command_class');
const command_handler = require('../command_handler');

module.exports = {
    init: function () {
        let cmd = new Command("Help", ["help", "h"], "A help command.", "help [optional:command]", (args, message, walter) => {
            if (args.length > 0) {
                let q_cmd = command_handler.getCommand(args[0]);
                if ( q_cmd != false ) {
                    let return_msg = `**Help** for command: **${q_cmd.name}**\n`;
                    return_msg += `> Command: \``;
                    for ( call of q_cmd.call ) {
                        return_msg += call + `, `;
                    }
                    return_msg = return_msg.slice(0, return_msg.length - 2);
                    return_msg += `\`\n`;
                    return_msg += `> Description: \`${q_cmd.description}\`\n`;
                    return_msg += `> Usage: \`${q_cmd.usage}\`\n`;
                    message.channel.send(return_msg);
                } else {
                    message.channel.send("🟥 **Error:** `command not found!`");
                }
            } else {
                let cmd_list = command_handler.getCmdList();
                let cmd_list_str = "";
                let cnt = 0;
                for ( cmd of cmd_list ) {
                    cnt += 1;
                    cmd_list_str += `> **${cmd.name}:** \`${cmd.usage}\`\n`;
                }
                let return_msg = `**List of Commands (${cnt}):**\n` + cmd_list_str;
                message.channel.send(return_msg);
            }
        });

        return cmd;
    }
}