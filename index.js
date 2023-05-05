const { Telegraf } = require("telegraf");
const axios = require("axios");
const express = require('express');

require("dotenv").config();

// Import coins object
const coins = require("./commands/text_command/coins.js");
const keywords = require("./commands/text_command/keywords.js");

// Create app
const app = express();

// Create a new Telegraf bot
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.hears(Object.keys(keywords), async (ctx) => {
    const buttons = keywords[ctx.message.text.toLowerCase()];
    const inlineKeyboard = { inline_keyboard: buttons };

    const options = { reply_markup: inlineKeyboard };

    await ctx.reply("Select from the following", options);
});

// Define a command handler for messages that match the coins object keys
bot.hears(Object.keys(coins), async (ctx) => {
    try {
        const coinName = ctx.message.text.toLowerCase();
        const coin = coins[coinName];

        // If coin is supported, call the API to get ticker data
        if (coin) {
            const optionsHeader = { headers: { "User-Agent": "Mozilla/5.0" } }; // Add headers

            const response = await axios.get(process.env.API_ENDPOINT, optionsHeader);

            const coinData = response.data.data[coin.index];

            // Format the message with the ticker data
            const message = generateCoinMessage(coin, coinData);

            // Add inline keyboard with refresh button
            const inlineKeyboard = {
                inline_keyboard: [
                    /* Inline buttons. 2 side-by-side */
                    ...keywords.spot,
                    /* One button */
                    [{ text: "Refresh 🔄", callback_data: `${coinName}` }],
                ],
            };

            const options = { parse_mode: "Markdown", reply_markup: inlineKeyboard };

            // Send the message with the inline keyboard
            await ctx.reply(`\`${message}\``, options);
        }
    } catch (error) {
        console.error(error);
    }
});

// Define a callback query handler for refresh button
bot.action(Object.keys(coins), async (ctx) => {
    try {
        const coinName = ctx.callbackQuery.data;
        const coin = coins[coinName];

        const optionsHeader = { headers: { "User-Agent": "Mozilla/5.0" } }; // Add headers

        // Call the API to get updated ticker data
        const response = await axios.get(process.env.API_ENDPOINT, optionsHeader);

        // const result = response.json();

        const coinData = response.data.data[coin.index];

        // Format the updated message with the new ticker data
        const message = generateCoinMessage(coin, coinData);

        // Edit the original message with the updated message and remove the inline keyboard
        const inlineKeyboard = {
            inline_keyboard: [
                /* Inline buttons. 2 side-by-side */
                ...keywords.spot,
                /* One button */
                [{ text: "Refresh 🔄", callback_data: `${coinName}` }],
            ],
        };

        const options = { parse_mode: "Markdown", reply_markup: inlineKeyboard };

        // Send the message with the inline keyboard
        try {
            return await ctx.editMessageText(`\`${message}\``, options);
        } catch (error) {
            if (error.message.includes("message is not modified")) {
                // console.log("Message is not modified.");
            } else {
                console.error(error);
            }
        }
    } catch (error) {
        console.error(error);
    }
});

bot.on('new_chat_members', (ctx) => {
    // Delete the message that announces the user joined the group
    ctx.deleteMessage();
});

function generateCoinMessage(coin, coinData) {
    // const coinData = data.data[coin.index];
    // console.log(coinData);

    const lastPrice = parseFloat(coinData.last).toFixed(2);
    const high24 = parseFloat(coinData.high).toFixed(2);
    const low24 = parseFloat(coinData.low).toFixed(2);
    const volume24 = parseFloat(coinData.vol).toFixed(2);
    const change = parseFloat(coinData.price_change).toFixed(2);
    const changePercent = parseFloat(coinData.price_change_percent).toFixed(2);

    let directionEmoji = "↘️";
    if (change > 0) {
        directionEmoji = "↗️";
    }

    const emojis = ["😞", "😟", "😕", "😐", "🙂", "😊", "😄", "😁", "😆", "😃"];

    const percentEmoji = getEmoji(emojis, changePercent);

    return (
        `${coin.name.replace("_", " ").toUpperCase()}\n` +
        `Last price:      ${lastPrice}\n` +
        `24 High:         ${high24} ⬆️\n` +
        `24 Low:          ${low24} ⬇️\n` +
        `V24:             ${volume24}\n` +
        `Change:          ${change} ${directionEmoji}\n` +
        `24 Change:       ${changePercent}% ${percentEmoji}\n`
    );
}

function getEmoji(emojis, changePercent) {
    // Define the range of changePercent and the size of each slice
    const range = 20;
    const sliceSize = range / (emojis.length - 1);

    // Calculate the slice index based on the changePercent value
    const sliceIndex = Math.min(
        Math.max(
            Math.round(changePercent / sliceSize) + (emojis.length - 1) / 2,
            0
        ),
        emojis.length - 1
    );

    // Get the emoji for the corresponding slice index
    return emojis[Math.floor(sliceIndex)];
}

bot.catch((err, ctx) => {
    console.log(`Error occurred for user ${ctx.from.id}:`, err);
    // Do something to handle the error, such as sending an error message
});


app.get('/ping', (req, res) => {
    res.send('pong');
    bot.startPolling();
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    // Start the bot
    // console.log(`Server listening on port ${SERVER}:${PORT}`);
});


// Start the bot
bot.startPolling();
