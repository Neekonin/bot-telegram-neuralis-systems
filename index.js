const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const path = require("path");

const app = express();
app.use(express.json());

// Servir arquivos estáticos (imagens)
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Variáveis de ambiente
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const URL = process.env.RENDER_EXTERNAL_URL;

if (!TOKEN || !URL) {
  throw new Error("Variáveis de ambiente não configuradas.");
}

// Inicializa o bot (webhook)
const bot = new TelegramBot(TOKEN);

// Configura webhook
bot.setWebHook(`${URL}/bot${TOKEN}`);

// Endpoint chamado pelo Telegram
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Comando /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Neuralis Systems: Em que posso ajudar?");
});

// Handler de mensagens de texto
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.toLowerCase();

  // Ignora mensagens sem texto ou comandos
  if (!text || text.startsWith("/")) return;

  // Mensagem específica
  if (text === "senha") {
    bot.sendPhoto(
      chatId,
      path.join(__dirname, "assets", "alice.png"),
      { caption: "Aqui está a sua solicitação." }
    );
  }
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
