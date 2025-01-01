const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  try {
    const response = await axios.post('https://api.deepseek.com/v1/chat', {
      message: userMessage
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      }
    });

    bot.sendMessage(chatId, response.data.answer);
  } catch (error) {
    bot.sendMessage(chatId, 'Error processing your request.');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});