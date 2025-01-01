const express = require('express');
console.log("TELEGRAM_TOKEN:", process.env.TELEGRAM_TOKEN);
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY);
console.log("VERCEL_URL:", process.env.VERCEL_URL);
const TelegramBot = require('node-telegram-bot-api');
const { Configuration, OpenAIApi } = require('openai');

// 检查环境变量是否设置
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!TELEGRAM_TOKEN || !OPENAI_API_KEY) {
  console.error("请设置 TELEGRAM_TOKEN 和 OPENAI_API_KEY 环境变量");
  process.exit(1);
}

// 初始化 Telegram 机器人
const bot = new TelegramBot(TELEGRAM_TOKEN, { webHook: { url: process.env.VERCEL_URL + '/' + TELEGRAM_TOKEN } });
bot.setWebHook(process.env.VERCEL_URL + '/' + TELEGRAM_TOKEN);

// 初始化 OpenAI
const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

// 初始化 Express
const app = express();
app.use(express.json());

// 处理 Webhook 请求
app.post('/' + TELEGRAM_TOKEN, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('App is listening on port ' + PORT);
});