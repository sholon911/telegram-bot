require('dotenv').config();
const { Telegraf } = require('telegraf');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); // 兼容 ES Modules

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const deepseekApiKey = process.env.DEEPSEEK_API_KEY; // 从环境变量中获取 DeepSeek API Key

if (!bot.telegram || !deepseekApiKey) {
    console.error('错误：未设置 TELEGRAM_TOKEN 或 DEEPSEEK_API_KEY 环境变量');
    process.exit(1);
}

bot.start((ctx) => ctx.reply('欢迎使用 DeepSeek 机器人！'));

bot.on('text', async (ctx) => {
    const message = ctx.message.text;

    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', { // 请替换成Deepseek正确的API endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${deepseekApiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat", // 请替换成 Deepseek 正确的模型名称
                messages: [{ role: "user", content: message }]
            })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Deepseek API Error:", errorData);
          return ctx.reply(`Deepseek API 请求失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const reply = data.choices[0].message.content; //根据Deepseek的API返回格式修改
        ctx.reply(reply);
    } catch (error) {
        console.error('请求 Deepseek API 发生错误:', error);
        ctx.reply('与 Deepseek API 通信时发生错误。');
    }
});

bot.launch();
console.log("Token and Deepseek API key is load");
console.log("Telegram bot started");