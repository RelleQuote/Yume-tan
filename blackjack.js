const Discord = require('discord.js');
const fs = require('fs');

const notStarted = 1;
const started = 2;

const hit = 'hit';
const doubleDown = 'doubledown';
const stand = 'stand';
const split = 'split';
const insurance = 'insurance';
const surrender = 'surrender';

const TICK = 15000;
var intervalID;
var gameState;
var currentPlayers = [];
var deck = [];
var turn;

module.exports = {
    playBlackJack: function (client, message, command, server) {
        playBlackjack(client, message, command, server);
    }
}

function playBlackjack(client, message, command, server) {
    if (server.gameRoom.players && gameState === notStarted) {
        intervalID = setInterval(blackjacktick(client, message, command, server), TICK);
    }
}

function blackjacktick(client, message, command, server) {
    if (server.gameRoom.players) {
        if (gameState === started) {
            //keep the game going
            for (var i = 0; i < currentPlayers.length; i++) {
                //read the moves of the players at the end of this tick
                if (currentPlayers[i].state === hit) {

                }
            }
        } else {
            //start the next game
        }
    } else {
        clearInterval(intervalID);
    }
}

function createDeck() {
    for (var i = 0; i < 52; i++) {

    }
}

function dealCards() {

}

function dealerTurn() {

}