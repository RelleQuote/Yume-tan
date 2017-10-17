// Import the discord.js module
const Discord = require('discord.js');
const fs = require('fs');
const jackblack = require('./blackjack.js');

const GAMEPATH = './resources/game/';
const MAPS = require(GAMEPATH + 'map.json');

var overworld = MAPS.overworld;
overworld.width = MAPS.overworld.width;
overworld.height = MAPS.overworld.height;
overworld.world = makeWorld(MAPS.overworld);

var player = JSON.parse(fs.readFileSync("./resources/game/userpoints.json", "utf8"));
var servers = {};

module.exports = {
    gameCommands: function (client, message, command, args) {
        gameCommands(client, message, command, args);
    }
}

function gameCommands(client, message, command, args) {

    if (!servers[message.guild.id]) {
        servers[message.guild.id] = {
            gameRoom: {
                game: null,
                players: [],
                playerLimit: null
            }
        };
    }

    var server = servers[message.guild.id];

    switch (command) {
        case ('where'):
            describeWhere(message);
            break;
        case ('stats'):
            viewStats(message);
            break;
        case ('levelup'):
            buyLevel(message);
            break;
        case ('test'):
            getShards(message);
            break;

        case ('blackjack'):
            blackjack(message, server);
            break;
        case ('startblackjack'):
            jackblack.playBlackJack(client, message, command, server);
            break;
    }
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function viewStats(message) {
    if (message.author.bot) return;
    
    let userData = checkNewPlayer(message);

    message.reply(`Your current level is **${userData.level}**!\nYou currently have **${userData.shards}** dream shards.\nYour next level will cost you **${(userData.level + 1) * 100}** dream shards.`);
}

function buyLevel(message) {
    if (message.author.bot) return;

    let userData = checkNewPlayer(message);

    if (userData.shards >= userData.level * 100) {

        userData.shards -= userData.level * 100;
        userData.level++;

        message.reply(`Your current level is **${userData.level}**!\nYou currently have **${userData.shards}** dream shards.`);
        fs.writeFile("./resources/game/userpoints.json", JSON.stringify(player), (err) => {
            if (err) console.error(err)
        });
    } else {
        message.reply(`You need **${((userData.level + 1) * 100) - userData.shards}** more dream shards to buy your next level!`);
    }
}

function checkNewPlayer(message) {
    if (!player[message.author.id]) {
        player[message.author.id] = {
            shards: 20,
            level: 1
        };
        fs.writeFile("./resources/game/userpoints.json", JSON.stringify(player), (err) => {
            if (err) console.error(err)
        });
    }
    return player[message.author.id];
}

function getShards(message) {
    if (message.author.bot) return;

    let userData = checkNewPlayer(message);

    userData.shards += 600;

    fs.writeFile("./resources/game/userpoints.json", JSON.stringify(player), (err) => {
        if (err) console.error(err)
    });
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function blackjack(message, server) {
    if (message.author.bot) return;

    let userData = checkNewPlayer(message);

    if (server.gameRoom.players.indexOf(message.author.id) != -1) {
        message.reply('Thank you for joining in blackjack, ' + message.author.username + '.\nYou will be cashed out after this game.');
    } else if (userData.shards >= 20) {
        server.gameRoom.players.push(message.author.id);
        message.reply('Thank you for joining in blackjack, ' + message.author.username + '.\nYou will be included in the next game.');
    } else {
        message.reply('Sorry, you do not have enough dream shards to participate. Please acquire at least 20 shards before joining in blackjack.');
    }
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function makeWorld(world) {
    // Maps are default 43 * 43 in size
    var mapArray = [];
    for (i = 0; i < world.height; i++) {
        var lineArray = [];
        for (j = 0; j < world.width; j++) {
            lineArray[j] = world.world[i * world.width + j];
        }
        mapArray[i] = lineArray;
    }
    return mapArray;
}

function describeWhere(message) {
    message.reply("to be implemented");
}