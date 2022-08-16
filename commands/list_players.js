const { Command } = require('../command_class');

module.exports = {
    init: function () {
        let cmd = new Command("List", ["list", "l"], "A list of online players.", "list", (args, message, walter) => {
            let player_list = "";
            let cnt = 0;
            for ( player in walter.players ) {
                cnt += 1;
                player_list += "> " + player + "\n";
            }
            let return_msg = `**Online Players (${cnt}):**\n` + player_list;
            message.channel.send(return_msg);
        });

        return cmd;
    }
}