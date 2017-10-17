// Import modules
const Discord = require('discord.js');
const music = require('discord.js-music');
const YTDL = require('ytdl-core');
const getInfo = require('ytdl-getinfo');
const Youtube = require("youtube-api");
const fs = require('fs');

const voice = require('./yume-voice.js');
const game = require('./yume-games.js');

// Import properties from the config file
const config = require("./config.json");

// Create an instance of a Discord client
const client = new Discord.Client();

// The token of your bot
const token = config.token;

var servers = {};

var ready = true;

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
    console.log('I am ready!');
    client.user.setGame('with itself');
});

client.on('message', message => {
    
    const args = message.content.slice(config.chat.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const cmd = message.content.substring(0, 1);

    switch (cmd) {
        case (config.chat):

            switch (command) {
                case ('args'):
                    message.channel.send(args[0]);
                    break;
                case ('ping'):
                    message.channel.send('pong');
                    break;
            }
            break;


        case (config.audio):

            voice.voiceCommands(client, message, command, args);
            
            break;

        case (config.game):

            game.gameCommands(client, message, command, args);

            break;
    }

});

// Log our bot in
client.login(token);