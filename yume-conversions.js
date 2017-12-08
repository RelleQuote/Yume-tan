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
        case ('help'):
            conversionHelp(message);
            break;
    }
}

function convert(message, args) {
    if (!isNaN(args[0])) {
        if (isMetricLength(args[1]) || isImperialLength(args[1]) || isMetricLength(args[2]) || isImperialLength(args[2])) {
            convertLength(message, args);
        } else if (isMetricVolume(args[1]) || isImperialVolume(args[1]) || isMetricVolume(args[2]) || isImperialVolume(args[2])) {
            convertVolume(message, args);
        }
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
function convertLength(message, args) {
    var result;
    if (args[1] === args[2]) {
        result = args[0];
    } else if (isMetricLength(args[1])) {
        result = toMetres(args[0], args[1]);
        if (isMetricLength(args[2])) {
            result = toOutputLength(result, args[2]);
            sendAnswer(message, args, result);
        } else if (isImperialLength(args[2])) {
            result = toOutputLength(metresToYards(result), args[2]);
            sendAnswer(message, args, result);
        } else {
            message.reply("Sorry, I couldn't convert your number. Please check the units you have selected.");
        }

    } else if (isImperialLength(args[1])) {
        result = toYards(args[0], args[1]);
        if (isMetricLength(args[2])) {
            result = toOutputLength(yardsToMetres(result), args[2]);
            sendAnswer(message, args, result);
        } else if (isImperialLength(args[2])) {
            result = toOutputLength(result, args[2]);
            sendAnswer(message, args, result);
        } else {
            message.reply("Sorry, I couldn't convert your number. Please check the units you have selected.");
        }

    } else {
        message.reply("Sorry, I couldn't convert your number. Please check the units you have selected.");
    }
}

function isMetricLength(unit) {
    if (unit === 'mm' || unit === 'cm' || unit === 'm' || unit === 'km') {
        return true;
    } else {
        return false;
    }
}

function isImperialLength(unit) {
    if (unit === 'in' || unit === 'ft' || unit === 'yd' || unit === 'mile' || unit === 'naut') {
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
function toOutputLength(length, unit) {
    if (isImperialLength(unit) || isMetricLength(unit)) {
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

//--------------------------------------------------Volume--------------------------------------------------
function convertVolume(message, args) {
    var result;
    if (args[1] === args[2]) {
        result = args[0];
    } else if (isMetricVolume(args[1])) {
        result = toDecimetres3(args[0], args[1]);
        if (isMetricVolume(args[2])) {
            result = toOutputVolume(result, args[2]);
            sendAnswer(message, args, result);
        } else if (isImperialVolume(args[2])) {
            result = toOutputVolume(decimetres3ToFeet3(result), args[2]);
            sendAnswer(message, args, result);
        } else {
            message.reply("Sorry, I couldn't convert your number. Please check the units you have selected.");
        }

    } else if (isImperialVolume(args[1])) {
        result = toFeet3(args[0], args[1]);
        if (isMetricVolume(args[2])) {
            result = toOutputVolume(feet3ToMetres3(result), args[2]);
            sendAnswer(message, args, result);
        } else if (isImperialVolume(args[2])) {
            result = toOutputVolume(result, args[2]);
            sendAnswer(message, args, result);
        } else {
            message.reply("Sorry, I couldn't convert your number. Please check the units you have selected.");
        }

    } else {
        message.reply("Sorry, I couldn't convert your number. Please check the units you have selected.");
    }
}

function isMetricVolume(unit) {
    if (unit === 'cm3' || unit === 'dm3' || unit === 'm3' || unit === 'ml' || unit === 'l' || unit === 'kl') {
        return true;
    } else {
        return false;
    }
}

function isImperialVolume(unit) {
    if (unit === 'in3' || unit === 'ft3' || unit === 'usoz' || unit === 'uspt' || unit === 'usgal' || unit === 'ukoz' || unit === 'ukpt' || unit === 'ukgal') {
        return true;
    } else {
        return false;
    }
}

function decimetres3ToFeet3(volume) {
    return volume * 0.0353;
}

function feet3ToMetres3(volume) {
    return volume * 0.02832;
}

//Converts millimetres, centimetres and kilometres to metres
function toDecimetres3(volume, unit) {
    switch (unit) {
        case "cm3":
            volume /= 1000;
            break;
        case "m3":
            volume *= 1000;
            break;
        case "ml":
            volume /= 1000;
            break;
        case "kl":
            volume *= 1000;
            break;
    }
    return volume;
}

//Converts inches, feet, miles and nautical miles to yards
function toFeet3(volume, unit) {
    switch (unit) {
        case "in3":
            volume /= 1728;
            break;
        case "usoz":
            volume /= 957.506;
            break;
        case "uspt":
            volume /= 59.8442;
            break;
        case "usgal":
            volume /= 7.48052;
            break;
        case "ukoz":
            volume /= 996.614;
            break;
        case "ukpt":
            volume /= 49.8307;
            break;
        case "ukgal":
            volume /= 6.22884;
            break;
    }
    return volume;
}

//Converts from either metres or yards to the desired unit
function toOutputVolume(volume, unit) {
    if (isImperialVolume(unit) || isMetricVolume(unit)) {
        switch (unit) {
            case "cm3":
                volume *= 1000;
                break;
            case "dm3":
                volume /= 1000;
                break;
            case "ml":
                volume *= 1000000;
                break;
            case "l":
                volume *= 1000;
                break;
            case "in3":
                volume *= 1728;
                break;
            case "usoz":
                volume *= 957.506;
                break;
            case "uspt":
                volume *= 59.8442;
                break;
            case "usgal":
                volume *= 7.48052;
                break;
            case "ukoz":
                volume *= 996.614;
                break;
            case "ukpt":
                volume *= 49.8307;
                break;
            case "ukgal":
                volume *= 6.22884;
                break;
        }
    }
    return volume;
}
//--------------------------------------------------Volume End--------------------------------------------------

function conversionHelp(message) {
    message.reply("The available commands are:\n"
        + "= help(Brings up the help text for the conversion module) \n"
        + "=convert num unit1 unit2 \n"
        + "    (converts num from unit1 to unit2. Units can be for length or volume and must match categories.\n"
        + "     LENGTH:\n"
        + "     Available metric units are: 'mm', 'cm', 'm', 'km'.\n"
        + "     Available Imperial units are: 'in', 'ft', 'yd', 'mile', 'naut'.\n"
        + "     VOLUME:\n"
        + "     Available metric units are: 'cm3', 'dm3', 'm3', 'ml', 'l', 'kl'.\n"
        + "     Available Imperial units are: 'in3', 'ft3', 'usoz', 'uspt', 'usgal', 'ukoz', 'ukpt', 'ukgal'.)");
}