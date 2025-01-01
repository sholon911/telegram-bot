const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { Configuration, OpenAIApi } = require('openai');

// 检查环境变量是否设置
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!TELEGRAM_TOKEN || !DEEPSEEK_API_KEY) {
  console.error("请设置 TELEGRAM_TOKEN 和 DEEPSEEK_API_KEY 环境变量");
  process.exit(1);
}

// 初始化 Telegram 机器人（使用 Webhook 模式）
const bot = new TelegramBot(TELEGRAM_TOKEN, {
  webHook: { url: process.env.VERCEL_URL + '/' + TELEGRAM_TOKEN },
  cancelable: true, // 启用取消功能，避免弃用警告
});

// 设置 Webhook
bot.setWebHook(process.env.VERCEL_URL + '/' + TELEGRAM_TOKEN);

// 初始化 DeepSeek（使用 OpenAI 的 SDK）
const configuration = new Configuration({
  apiKey: DEEPSEEK_API_KEY,
  basePath: "https://api.deepseek.com/v1", // 替换为 DeepSeek 的实际 API 端点
});
const openai = new OpenAIApi(configuration);

// 初始化 Express
const app = express();
app.use(express.json());

// 处理 Webhook 请求
app.post('/' + TELEGRAM_TOKEN, async (req, res) => {
  try {
    const update = req.body;
    const chatId = update.message.chat.id;
    const userMessage = update.message.text;

    // 调用 DeepSeek API
    const response = await openai.createCompletion({
      model: "text-davinci-003", // 替换为 DeepSeek 支持的模型
      prompt: userMessage,
      max_tokens: 150,
      timeout: 10000, // 增加超时时间
    });

    // 将 DeepSeek 的回复发送给用户
    bot.sendMessage(chatId, response.data.choices[0].text.trim());
  } catch (error) {
    console.error("DeepSeek 请求失败:", error);
    bot.sendMessage(chatId, "抱歉，我暂时无法处理你的请求。");
  }
  res.sendStatus(200);
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('App is listening on port ' + PORT);
});