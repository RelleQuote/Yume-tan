const Discord = require('discord.js');
const fs = require('fs');
const schedule = require('node-schedule');

var rule = new schedule.RecurrenceRule();
rule.second = 30;

module.exports = {
    playBlackJack: function (client, message, command, server) {
        playBlackjack(client, message, command, server);
    }
}

function playBlackjack(client, message, command, server) {
    var blackjack = schedule.scheduleJob(rule, function () {
        if (!server.gameRoom.players && blackjack) {
            blackjack.cancel();
        } else {
            blackjacktick(client, message, command, server);
        }
    });
}

function blackjacktick(client, message, command, server) {

}