const DiscordJS = require('discord.js');
const discord_client = new DiscordJS.Client({ 
    intents: [
        DiscordJS.GatewayIntentBits.Guilds,
        DiscordJS.IntentsBitField.Flags.Guilds,
        DiscordJS.IntentsBitField.Flags.GuildMembers,
        DiscordJS.IntentsBitField.Flags.GuildMessages,
        DiscordJS.GatewayIntentBits.MessageContent
    ] 
});

const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')

const conf = require("./conf.json");
const assets = require("./assets")
const command_handler = require("./command_handler");
const { chat_log } = require("./assets");

const walter_opts = {
    host: conf.server.ip, // minecraft server ip
    port: conf.server.port,
    version: conf.server.version,
    username: conf.user.name, // minecraft username
    // password: '12345678' // minecraft password, comment out if you want to log into online-mode=false servers
}

let walter;
let global_state_default = {
    spawn_cnt: 0,
    discord_ready: false,
    afkCnt: true,
    afkInv: undefined
};
let global_state = { ...global_state_default };

let pathfinder_utils = {
    mcData: undefined,
    defaultMove: undefined
}

function make_walter () {
    assets.initFileHandler();
    log("Making new walter with options", 0);
    log(walter_opts, 0);
    // const walter = mineflayer.createBot(walter_opts);
    global_state = { ...global_state_default };
    walter = mineflayer.createBot(walter_opts);
    walter.loadPlugin(pathfinder);
    bind_events_to_walter(walter);
}

function bind_events_to_walter (walter_instance) {
    walter_instance.on('spawn', () => {
        global_state.spawn_cnt += 1;
        log("Spawned! " + global_state.spawn_cnt, 0);

        // Lobby (prob)
        if ( global_state.spawn_cnt == 1 ) {
            log("Prob connected to lobby", 0);
            log("Attepmting to login in 1s", 0);
            
            setTimeout(function () { 
                walter_instance.chat('/l ' + conf.server.password); 
                log("Logged in, attempting to connect to anarchy in few sec", 0);
            }, 1000);
            
            setTimeout(function () { 
                walter_instance.activateItem(offHand=false); 
                log("Opening selector menu", 0);
            }, 4000);

            setTimeout(function () { 
                walter_instance.clickWindow(38, 1, 0, (err) => { 
                    log_err(err);
                    console.error(err);
                }); 
                log("Selecting Anarchy", 0); 
            }, 5000);
        } else if ( global_state.spawn_cnt == 2 ) {
            if ( assets.anarchy_check(walter.entity.position, conf.server.anarchy_check) ) {
                log("Joined anarchy...", 0);
                
                pathfinder_utils.mcData = require('minecraft-data')(walter.version);
                pathfinder_utils.defaultMove = new Movements(walter, pathfinder_utils.mcData);

                pathfinder_utils.defaultMove.canDig = false;
                pathfinder_utils.defaultMove.allowParkour = false;
                pathfinder_utils.defaultMove.allowSprinting = false;
                pathfinder_utils.defaultMove.maxDropDown = 2;

                global_state.afkInv = setInterval(antiAfk, conf.server.antiafk.interval);
            } else {
                log("Error joining anarchy!", 0);
            }
        } else {
            if ( assets.anarchy_check(walter.entity.position, conf.server.anarchy_check) ) {
                log("Respawned but still on anarchy...", 0);
            } else {
                log("No longer on anarchy", 0);
            }
        }
    })

    /* walter_instance.on("chat", (username, message, translate, jsonMsg, matches) => {
        if (username === walter.username) return;
        console.log(username, message);
        // walter.chat(message)
    }) */

    walter_instance.on("message", (jsonMsg, position) => {
        chat_log(JSON.stringify(jsonMsg));
        let msg = gamster_message_handler(jsonMsg.json);
        // { author, content, extra }
        if ( msg != 0 && msg != -1 && msg != -2 ) {
            if ( msg.extra != undefined ) {
                // msg has extra in extra?...
                handle_msg({author: msg.author, content: msg.content});
            } else {
                handle_msg({author: msg.author, content: msg.content});
            }
        }
    })

    // Log errors and kick reasons:
    walter_instance.on('kicked', console.log)
    walter_instance.on('error', console.log)
}

make_walter();

function log (msg, priv) {
    if ( priv == 0 ) {
        // priv 0, only i should see these msg
        console.log(msg);
    } else if ( priv == 1 ) {
        // priv 1, only mods should see these msg
        console.log(msg);
    } else {
        // idk...
        console.log(msg);
    }
}

function log_err (err) {
    console.error(err);
}

function gamster_message_handler (msg) { // returns { author, message, extra } or -1
    if ( msg.text != '' ) {
        // ALERT

        // return -2;
        // Example of leave msg
        /*
            {
            color: 'yellow',
            translate: 'multiplayer.player.left',
            with: [ { text: 'OsakiTsukiko' } ]
            }
        */
       // No join msg :skull:
    }

    if ( msg.extra != undefined && msg.extra.length > 0 ) {
        if ( msg.extra[0].text == ' ┃' && msg.extra.length > 5 ) {
            // msg is a user sent message
            let author = msg.extra[2].text;
            let content = msg.extra[5].text;
            let extra;
            for ( let i = 6; i < msg.extra.length; i += 1 ) {
                extra += msg.extra[i].text + " ";
            }

            return { author, content, extra }

        }

        return 0;
        // msg isnt a user sent message
    }

    return -1;
}

function handle_msg (msg) { // msg: { author, content }
    // console.log("[" + msg.author + "]: " + msg.content);
    if ( global_state.discord_ready && assets.anarchy_check(walter.entity.position, conf.server.anarchy_check) ) {
        if ( msg.author != conf.user.name ) {
            let msg_embeed = assets.chatBridgeMSGEmbeed(msg.author, msg.content, conf.discord.color.bridge.msg, conf.server.ip);
            for ( channel_id of conf.discord.chat_bridge ) {
                discord_client.channels.cache
                    .get(channel_id)
                    .send({ 
                        embeds: [msg_embeed] 
                    });
            }
            if ( msg.author == "OsakiTsukiko" ) {
            // Commands
            }
        } else {
            let msg_embeed = assets.chatBridgeMSGEmbeed(msg.author, msg.content, conf.discord.color.bridge.msg, conf.server.ip);
            for ( channel_id of conf.discord.selflog ) {
                discord_client.channels.cache
                    .get(channel_id)
                    .send({ 
                        embeds: [msg_embeed] 
                    });
            }
        }
    }
}

function antiAfk () {
    if ( conf.server.antiafk.enabled && assets.anarchy_check(walter.entity.position, conf.server.anarchy_check) ) {
        walter.pathfinder.setMovements(pathfinder_utils.defaultMove);
        if ( global_state.afkCnt ) {
            walter.pathfinder.setGoal(
                new GoalNear(
                    conf.server.antiafk.pos1.x, 
                    conf.server.antiafk.pos1.y, 
                    conf.server.antiafk.pos1.z, 
                    1)
            );
        } else {
            walter.pathfinder.setGoal(
                new GoalNear(
                    conf.server.antiafk.pos2.x, 
                    conf.server.antiafk.pos2.y, 
                    conf.server.antiafk.pos2.z, 
                    1)
            );
        }
        global_state.afkCnt = !global_state.afkCnt;
    }
}

// DISCORD

discord_client.on('ready', () => {
    console.log(`Logged in as ${discord_client.user.tag}!`);
    global_state.discord_ready = true;
    command_handler.loadCommands();
});

discord_client.on('messageCreate', (message) => {
    if ( !conf.discord.chat_bridge.includes(message.channel.id) ) return; 
    if ( message.author.id == discord_client.user.id ) return;
    if ( !assets.anarchy_check(walter.entity.position, conf.server.anarchy_check) ) {
        message.react("🟥");
        message.channel.send("🟥 **Error:** `Bot no longer on Anarchy!` (<@" + conf.discord.owner + ">)");
        return;
    }
    
    if ( message.content.toLowerCase().startsWith(conf.discord.prefix) ) {
        // command handler
        const args = message.content.slice(conf.discord.prefix.length).trim().split(' ');
        const command = args.shift().toLowerCase();
        if ( !command_handler.doCommand(command, args, message, walter) ) {
            message.react("🟥");
            message.channel.send("🟥 **Error:** `command doesnt exist, try " + conf.discord.prefix + "help for a list of commands`");
        }
    } else {
        if ( message.content.length > 200 ) {
            message.react("🟥");
            message.channel.send("🟥 **Error:** `max 200 characters per message!`")
        } else {
            let msg_content = message.content.replace(/[^\x00-\x7F]/g, "").replaceAll("\n", " ");
            walter.chat(`0xD [${message.author.username}]: ${msg_content}`);
            let msg_embeed = assets.chatBridgeDiscordEmbeed(message.author, msg_content, conf.discord.color.bridge.discord, message.channel.name);
            message.channel.send({ 
                embeds: [msg_embeed] 
            });
        }
    }
});

discord_client.login(conf.discord.token);