const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const VERCEL_URL = 'https://telegram-bot-omega-henna.vercel.app';

// 初始化 Telegram 机器人
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

// 设置 Webhook
const setWebhook = async () => {
  try {
    const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook`, {
      url: VERCEL_URL
    });
    console.log('Webhook set successfully:', response.data);
  } catch (error) {
    console.error('Error setting webhook:', error.response ? error.response.data : error.message);
  }
};

// 启动时设置 Webhook
setWebhook();

// 处理 Webhook 请求
app.use(express.json());
app.post('/', async (req, res) => {
  const { message } = req.body;
  if (message) {
    const chatId = message.chat.id;
    const userMessage = message.text;

    try {
      // 调用 DeepSeek API
      const deepseekResponse = await axios.post(
        'https://api.deepseek.com/v1/chat', // DeepSeek API 的 URL
        {
          message: userMessage
        },
        {
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // 将 DeepSeek API 的回复发送给用户
      const botReply = deepseekResponse.data.answer || 'No response from DeepSeek API.';
      bot.sendMessage(chatId, botReply);
    } catch (error) {
      console.error('Error calling DeepSeek API:', error.response ? error.response.data : error.message);
      bot.sendMessage(chatId, 'Sorry, there was an error processing your message.');
    }
  }
  res.sendStatus(200);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});