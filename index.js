const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
app.use(express.json());

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const URL = process.env.RENDER_EXTERNAL_URL;

if (!TOKEN || !URL) {
  throw new Error("Variáveis de ambiente não configuradas.");
}

// Inicializa o bot (sem polling)
const bot = new TelegramBot(TOKEN);

// Configura o webhook
bot.setWebHook(`${URL}/bot${TOKEN}`);

// Endpoint chamado pelo Telegram
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Comando básico
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Bot online na Render.");
});

// Health check
app.get("/", (req, res) => {
  res.send("Servidor ativo.");
});

// Porta dinâmica da Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
