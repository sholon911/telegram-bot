require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// 從環境變數中取得設定
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// 檢查必要的環境變數
if (!TELEGRAM_TOKEN) {
  console.error('錯誤：請在 .env 檔案中設定 TELEGRAM_TOKEN 環境變數。');
  process.exit(1);
}

if (!DEEPSEEK_API_KEY) {
  console.error('錯誤：請在 .env 檔案中設定 DEEPSEEK_API_KEY 環境變數。');
  process.exit(1);
}

// 建立 Telegram 機器人
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// 處理 /start 指令
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '歡迎使用我的機器人！請輸入訊息與我聊天。');
});

// 處理訊息
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  // 忽略非文字訊息和指令
  if (!userMessage || userMessage.startsWith('/')) {
    return;
  }

  try {
    // 呼叫 DeepSeek API
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat', // 添加 model 字段
        messages: [
          {
            role: 'user',
            content: `根據以下使用者訊息生成回覆：${userMessage}`,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const deepseekResponse = response.data;

    if (!deepseekResponse || !deepseekResponse.choices || deepseekResponse.choices.length === 0) {
      console.error("DeepSeek API 回應格式錯誤:", deepseekResponse);
      return bot.sendMessage(chatId, "DeepSeek 服務暫時無法使用。");
    }

    const botReply = deepseekResponse.choices[0].message.content.trim();
    bot.sendMessage(chatId, botReply);
  } catch (error) {
    console.error('處理訊息時發生錯誤：', error.response ? error.response.data : error.message);
    bot.sendMessage(chatId, '發生了一些錯誤，請稍後重試。');
  }
});

// 處理錯誤
bot.on('polling_error', (error) => {
  console.error('輪詢發生錯誤：', error);
});

console.log('機器人已啟動並使用輪詢...');