// Import the discord.js module
const Discord = require('discord.js');
const music = require('discord.js-music');
const YTDL = require('ytdl-core');
const getInfo = require('ytdl-getinfo');

// Import properties from the config file
const config = require("./config.json");

// Create an instance of a Discord client
const client = new Discord.Client();

music(client);

// Import file system module
const fs = require('fs');

// The token of your bot
const token = config.token;

// Collect names of all files in songs folder for playback
const SONGFLDR = './resources/songs/';
const songlist = fs.readdirSync(SONGFLDR);
var currentSong = 0;

var servers = {};

function play(connection, message) {
    var server = servers[message.guild.id];
    if (server.playlist[0]) {
        if (server.playlist[0].startsWith('yt:')) {
                playYT(connection, message);
            } else {//if (searchStringInArray(server.playlist[0], songlist) !== -1) {
                playF(connection, message);
            }
    } else {
        message.channel.send('There are no songs in the playlist!');
        return;
    }
}

function playF(connection, message) {
    var server = servers[message.guild.id];

    server.dispatcher = connection.playFile(SONGFLDR + server.playlist[0]);
    server.dispatcher.setVolume(0.2);
    client.user.setGame(server.playlist[0]);
    message.channel.send('Now playing: ' + server.playlist[0]);

    server.dispatcher.on('end', function () {
        server.playlist.shift();
        if (server.playlist[0] && connection) {
            play(connection, message);
        } else {
            connection.disconnect();
            client.user.setGame('with itself');
        }
    });
}

function playYT(connection, message) {
    var server = servers[message.guild.id];
    var link = server.playlist[0].substring(3);

    server.dispatcher = connection.playStream(YTDL(link, { filter: 'audioonly' }), { seek: 0, volume: 1 });
    //server.dispatcher.setVolume(0.2);
    client.user.setGame(link);
    message.channel.send('Now playing: ' + link);

    server.dispatcher.on('end', function () {
        server.playlist.shift();
        if (server.playlist[0]) {
            play(connection, message);
        } else {
            connection.disconnect();
            client.user.setGame('with itself');
        }
    });
}

var ready = true;

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
    console.log('I am ready!');
    client.user.setGame('with itself');
});

client.on('message', message => {

    var msg = message.content.toLowerCase();
    var args = msg.substring(1).split(' ');
    var cmd = msg.substring(0, 1);

    switch (cmd) {
        case (config.chat):

            switch (args[0]) {
                case ('args'):
                    message.channel.send(args);
                    break;
                case ('ping'):
                    message.channel.send('pong');
                    break;
            }
            break;


        case (config.audio):

            voiceCommands(message, args);
            
            break;

        case (config.game):
            break;
    }

});

function shuffle(playlist) {
    for (var i = 1; i < playlist.length - 1; i++) {
        var temp = playlist[i];
        var rnd = Math.floor(Math.random() * (playlist.length - 2) + 1);
        playlist[i] = playlist[rnd];
        playlist[rnd] = temp;
        if (i === currentSong) {
            currentSong = rnd;
        }
        if (rnd === currentSong) {
            currentSong = i;
        }
    }
}

function searchStringInArray(str, strArray) {
    for (var j = 0; j < strArray.length; j++) {
        if (strArray[j].toString().match(str.toString())) {
            console.log(j);
            return j;
        }
    }
    return -1;
}

function showPlaylist(message) {
    var server = servers[message.guild.id];
    var shortlist = [];
    for (i = 0; i < server.playlist.length && i < 10; i++) {
        shortlist[i] = (i + 1) + '. ' + server.playlist[i];
    }
    message.channel.send(shortlist);
}

function showSonglist(message) {
    var shortlist = [];
    for (i = 0; i < songlist.length && i < 10; i++) {
        shortlist[i] = songlist[i];
    }
    message.channel.send(shortlist);
}

function getSongTitle() {
    if (dv.getString(3, dv.byteLength - 128) === 'TAG') {
        var title = dv.getString(30, dv.tell());
    } else {
        // no ID3v1 data found.
    }
}

function getSongArtist() {
    var dv = new jDataView(this.result);

    // "TAG" starts at byte -128 from EOF.
    // See http://en.wikipedia.org/wiki/ID3
    if (dv.getString(3, dv.byteLength - 128) === 'TAG') {
        var artist = dv.getString(30, dv.tell());
    } else {
        return -1;
        // no ID3v1 data found.
    }
}

function voiceCommands(message, args) {

    if (!servers[message.guild.id]) {
        servers[message.guild.id] = {
            playlist: []
        };
    }

    switch (message, args[0]) {
        case ('play'):
            if (!message.member.voiceChannel) {
                message.reply('Please join a voice channel first.');
                return;
            }

            var server = servers[message.guild.id];

            if (!message.guild.voiceConnection) {
                message.member.voiceChannel.join().then(function (connection) {
                    play(connection, message);
                });
            }

            break;
        case ('next'):
            var server = servers[message.guild.id];
            if (server.dispatcher)
                server.dispatcher.end();
            break;
        case ('shuffle'):
            var server = servers[message.guild.id];
            shuffle(server.playlist);
            message.channel.send('I\'ve shuffled the playlist for you.');
            break;
        case ('playlist'):
            message.reply('Here is the current playlist.');
            showPlaylist(message);
            break;
        case ('songlist'):
            message.reply('Here are the available songs on disk. To add a song to the playlist, please copy paste the song\'s filename as a parameter to the $add command.');
            showSonglist(message);
            break;
        case ('np'):
            var server = servers[message.guild.id];
            message.channel.send('Now playing: ' + server.playlist[0]);
            break;
        case ('add'):
            if (searchStringInArray(args[1], songlist) !== -1) {
                var server = servers[message.guild.id];
                server.playlist.push(args[1]);
                message.channel.send('I\'ve added your song to the playlist');
            }
            break;
        case ('addyt'):
            if (args[1]) {
                var server = servers[message.guild.id];
                server.playlist.push('yt:' + args[1]);
                message.channel.send('I\'ve added your link to the playlist');
            }
            break;
        case ('end'):
            var server = servers[message.guild.id];
            if (message.guild.voiceConnection) {
                server.playlist.length = 0;
                message.guild.voiceConnection.disconnect();
            }
            break;
        case ('addall'):
            var server = servers[message.guild.id];
            server.playlist = songlist;
            message.channel.send('I\'ve added all the songs available to the playlist!');
            break;
        case ('pause'):
            var server = servers[message.guild.id];
            if (server.dispatcher) {
                if (server.dispatcher.paused === false) {
                    server.dispatcher.pause();
                }
            }
            break;
        case ('resume'):
            var server = servers[message.guild.id];
            if (server.dispatcher) {
                if (server.dispatcher.paused === true) {
                    server.dispatcher.resume();
                }
            }
            break;
    }
}

// Log our bot in
client.login(token);