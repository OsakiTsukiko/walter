var fs = require('fs');

let command_list;

module.exports = {
    loadCommands: function () {
        command_list = [];
        var files = fs.readdirSync("./commands/");
        for ( file of files ) {
            if ( !file.endsWith(".js") ) continue;
            let file_req = require("./commands/" + file);
            let cmd = file_req.init();
            command_list.push(cmd);
        }
        // console.log(command_list);
    },

    doCommand: function ( command, args, message, walter ) {
        for ( cmd of command_list ) {
            if ( cmd.call.includes(command.toLowerCase()) ) {
                cmd.fn(args, message, walter);
                return true;
            }
        }
        return false;
    },

    getCommand: function ( command ) {
        for ( cmd of command_list ) {
            if ( cmd.call.includes(command.toLowerCase()) ) {
                return cmd;
            }
        }
        return false;
    },

    getCmdList: function () {
        return command_list;
    }
}