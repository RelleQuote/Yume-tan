const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    conversionCommands: function (client, message, command, args) {
        conversionCommands(client, message, command, args);
    }
}

function conversionCommands(client, message, command, args) {

    switch (command) {
        case ('convert'):
            convert(message, args);
            break;
    }
}

function convert(message, args) {
    if (!isNaN(args[0])) {
        var result;
        //--------------------------------------------------Length--------------------------------------------------
        if (args[1] === args[2]) {
            result = args[0];
        } else if (isMetric(args[1])) {
            result = toMetres(args[0], args[1]);
            if (isMetric(args[2])) {
                result = toOutput(result, args[2]);
                sendAnswer(message, args, result);
            } else if (isImperial(args[2])) {
                result = toOutput(metresToYards(result), args[2]);
                sendAnswer(message, args, result);
            } else {
                message.reply("Sorry, I couldn't convert your number. Please check the units you have selected.");
            }

        } else if (isImperial(args[1])) {
            result = toYards(args[0], args[1]);
            if (isMetric(args[2])) {
                result = toOutput(yardsToMetres(result), args[2]);
                sendAnswer(message, args, result);
            } else if (isImperial(args[2])) {
                result = toOutput(result, args[2]);
                sendAnswer(message, args, result);
            } else {
                message.reply("Sorry, I couldn't convert your number. Please check the units you have selected.");
            }

        } else {
            message.reply("Sorry, I couldn't convert your number. Please check the units you have selected.");
        }
    } else {
        message.reply("Sorry, you did not properly specify a number.");
    }
}

function sendAnswer(message, args, result) {
    result = round(result)
    message.reply(args[0] + args[1] + " is equal to " + result + args[2] + ".");
}

function round(num) {
    return Math.round((num + 0.00001) * 100) / 100;
}

//--------------------------------------------------Length--------------------------------------------------
function isMetric(unit) {
    if (unit === 'mm' || unit === 'cm' || unit === 'm' || unit === 'km') {
        return true;
    } else {
        return false;
    }
}

function isImperial(unit) {
    if (unit === 'in' || unit === 'ft' || unit === 'yd'  || unit === 'mile' || unit === 'naut') {
        return true;
    } else {
        return false;
    }
}

function metresToYards(length) {
    return length * 1.0936;
}

function yardsToMetres(length) {
    return length * 0.9144;
}

//Converts millimetres, centimetres and kilometres to metres
function toMetres(length, unit) {
    switch (unit) {
        case "mm":
            length /= 1000;
            break;
        case "cm":
            length /= 100;
            break;
        case "km":
            length *= 1000;
            break;
    }
    return length;
}

//Converts inches, feet, miles and nautical miles to yards
function toYards(length, unit) {
    switch (unit) {
        case "in":
            length /= 36;
            break;
        case "ft":
            length /= 3;
            break;
        case "mile":
            length *= 1760;
            break;
        case "naut":
            length *= 2025.4;
            break;
    }
    return length;
}

//Converts from either metres or yards to the desired unit
function toOutput(length, unit) {
    if (unit === 'mm' || unit === 'cm' || unit === 'm' || unit === 'km' || unit === 'in' || unit === 'ft' || unit === 'mile' || unit === 'naut') {
        switch (unit) {
            case "mm":
                length *= 1000;
                break;
            case "cm":
                length *= 100;
                break;
            case "km":
                length /= 1000;
                break;
            case "in":
                length *= 36;
                break;
            case "ft":
                length *= 3;
                break;
            case "mile":
                length /= 1760;
                break;
            case "naut":
                length /= 2025.4;
                break;
        }
    }
    return length;
}
//--------------------------------------------------Length End--------------------------------------------------

function conversionHelp(message) {
    message.reply("The available commands are:\n"
        + "= help(Brings up the help text for the conversion module) \n"
        + "=convert num unit1 unit2 (converts num from unit1 to unit2.Available metric units are: 'mm', 'cm', 'm', 'km'.Available Imperial units are 'in', 'ft', 'yd', 'mile', 'naut'.)");
}