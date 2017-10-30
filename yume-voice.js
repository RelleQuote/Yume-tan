// Import the discord.js module
const Discord = require('discord.js');
const music = require('discord.js-music');
const YTDL = require('ytdl-core');
const getInfo = require('ytdl-getinfo');
const google = require('googleapis');
const youtube = google.youtube('v3');
const fs = require('fs');
const promise = require('promise');

// Import properties from the config file
const config = require("./config.json");

// The token of your bot
const token = config.token;
const CREDENTIALS = config.ytapikey;

module.exports = {
    voiceCommands: function (client, message, command, args) {
        voiceCommands(client, message, command, args);
    }
}

// Collect names of all files in songs folder for playback
const SONGFLDR = './resources/songs/';
const songlist = fs.readdirSync(SONGFLDR);
var currentSong = 0;

var servers = {};

function play(client, connection, message) {
    var server = servers[message.guild.id];
    if (server.playlist[0]) {
        if (server.playlist[0].startsWith('yt:')) {
            playYT(client, connection, message);
        } else {
            playF(client, connection, message);
        }
    } else {
        message.channel.send('There are no songs in the playlist!');
        return;
    }
}

function playF(client, connection, message) {
    var server = servers[message.guild.id];
    var songname = server.playlist[0];

    var pf = new Promise(
        function (resolve, reject) {
            if (server.playlist[0]) {
                server.dispatcher = connection.playFile(SONGFLDR + server.playlist[0]);
                resolve(server.dispatcher);
            } else {
                reject("Unable to play song.");
            }
        }
    );

    var playFile = function () {
        pf
            .then(function (fulfilled) {
                fulfilled.setVolume(0.2);
                client.user.setGame(songname);
                message.channel.send('Now playing: ' + songname);

                server.dispatcher.on('end', function () {
                    server.playlist.shift();
                    if (server.playlist[0]) {
                        play(client, connection, message);
                    } else {
                        connection.disconnect();
                        client.user.setGame('with itself');
                    }
                });
            })
            .catch(function (error) {
                console.log(error);
                server.playlist.shift();
                if (server.playlist[0] && connection) {
                    play(client, connection, message);
                } else {
                    connection.disconnect();
                    client.user.setGame('with itself');
                }
            });

    }

    playFile();
}

function playYT(client, connection, message) {
    var server = servers[message.guild.id];
    var link = server.playlist[0].substring(3);

    var pyt = new Promise(
        function (resolve, reject) {
            if (server.playlist[0]) {
                server.dispatcher = connection.playStream(YTDL(link, { audioonly: true }), { passes: 5 });
                resolve(server.dispatcher);
            } else {
                reject("Unable to play song.");
            }
        }
    );

    var playYoutube = function () {
        pyt
            .then(function (fulfilled) {
                fulfilled.setVolume(0.04);
                client.user.setGame(link);
                message.channel.send('Now playing: ' + link);

                server.dispatcher.on('end', function () {
                    server.playlist.shift();
                    if (server.playlist[0]) {
                        play(client, connection, message);
                    } else {
                        connection.disconnect();
                        client.user.setGame('with itself');
                    }
                });
            })
            .catch(function (error) {
                console.log(error);
                server.playlist.shift();
                if (server.playlist[0] && connection) {
                    play(client, connection, message);
                } else {
                    connection.disconnect();
                    client.user.setGame('with itself');
                }
            });

    }

    playYoutube();
}

function shuffle(playlist) {
    var server = servers[message.guild.id];
    var start;
    if (server.dispatcher) {
        start = 1;
    } else {
        start = 0;
    }

    for (var i = start; i < playlist.length - 1; i++) {
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

function addYTPage(pid, token, message) {
    var server = servers[message.guild.id];
    var addpl = new Promise(
        function (resolve, reject) {
            const results = youtube.playlistItems.list({
                key: config.ytapikey,
                part: 'snippet',
                playlistId: pid,
                maxResults: 50,
                fields: 'items/snippet/resourceId/videoId,nextPageToken',
                pageToken: token
            }, (err, results) => {
                if (results) {
                    resolve(results);
                } else {
                    reject('No items have been added to the playlist!');
                }
            });
        }
    );

    var addPlayList = function () {
        addpl
            .then(function (fulfilled) {
                for (i = 0; i < fulfilled.items.length; i++) {
                    console.log(fulfilled.items[i].snippet.resourceId.videoId);
                    server.playlist.push('yt:https://www.youtube.com/watch?v=' + fulfilled.items[i].snippet.resourceId.videoId);
                }
                message.channel.send(fulfilled.items.length + ' items have been added to the playlist!');
            })
            .catch(function (error) {
                console.log(error);
                message.channel.send("Unable to add to playlist!");
            });

    }

    addPlayList();
}

function voiceCommands(client, message, command, args) {

    if (!servers[message.guild.id]) {
        servers[message.guild.id] = {
            playlist: []
        };
    }

    switch (command) {
        case ('play'):
            if (!message.member.voiceChannel) {
                message.reply('Please join a voice channel first.');
                return;
            }

            var server = servers[message.guild.id];

            if (!message.guild.voiceConnection) {
                message.member.voiceChannel.join().then(function (connection) {
                    play(client, connection, message);
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
            if (searchStringInArray(args[0], songlist) !== -1) {
                var server = servers[message.guild.id];
                server.playlist.push(args[0]);
                message.channel.send('I\'ve added your song to the playlist');
            }
            break;
        case ('addyt'):
            if (args[0]) {
                var server = servers[message.guild.id];
                server.playlist.push('yt:' + args[0]);
                message.channel.send('I\'ve added your link to the playlist');
            }
            break;
        case ('addytpl'):
            if (args[0]) {
                addYTPage(args[0], null, message);
            }
            break;
        case ('end'):
            var server = servers[message.guild.id];
            if (message.guild.voiceConnection) {
                server.playlist.length = 0;
                message.guild.voiceConnection.disconnect();
            }
            break;
        case ('volume'):
            var server = servers[message.guild.id];
            if (!isNaN(args[0]) && server.dispatcher) {
                server.dispatcher.setVolume(args[0]);
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