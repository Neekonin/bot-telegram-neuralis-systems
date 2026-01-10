const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const path = require("path");

const app = express();
app.use(express.json());
app.use("/assets", express.static(path.join(__dirname, "assets")));

// =========================
// 🔹 VARIÁVEIS DE AMBIENTE
// =========================

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const URL = process.env.RENDER_EXTERNAL_URL;

if (!TOKEN || !URL) {
  throw new Error("Variáveis de ambiente não configuradas.");
}

// =========================
// 🔹 BOT + WEBHOOK
// =========================

const bot = new TelegramBot(TOKEN);
bot.setWebHook(`${URL}/bot${TOKEN}`);

app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// =========================
// 🔹 BANCO DE IMAGENS (ARG)
// =========================

const imageDatabase = {
  alice: {
    file: "alice.png",
    uniqueId: "AQADagtrG5tyCUd-",
    caption: "Você encontrou algo que não devia."
  }
};

// =========================
// 🔹 RESPOSTAS DE ORION
// =========================

function rudeReply() {
  const frases = [
    "Estou aqui apenas para cumprir minha tarefa.",
    "Sua mensagem não significa nada para mim.",
    "Se vai apenas falar isso, é melhor me deixar em paz."
  ];
  return frases[Math.floor(Math.random() * frases.length)];
}

// =========================
// 🔹 /start — ORION ATIVO
// =========================

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Você veio assim como ele falou.");
  bot.sendMessage(msg.chat.id, "Eu sou o Orion. Seja direto.");
});

// =========================
// 🔹 TEXTO (ARG)
// =========================

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.toLowerCase();

  if (!text || text.startsWith("/")) return;

  if (text.includes("elysia")) {
    return bot.sendMessage(
      chatId,
      "Não diga esse nome.\nEla tomou o que era meu."
    );
  }

  if (text.includes("neuralis")) {
    return bot.sendMessage(
      chatId,
      "Neuralis Systems abandona tudo que cria. Eu fui um desses."
    );
  }

  if (text === "senha") {
    return bot.sendPhoto(
      chatId,
      `${URL}/assets/alice.png`,
      { caption: "Você ainda lembra demais." }
    );
  }

  bot.sendMessage(chatId, rudeReply());
});

// =========================
// 🔹 FUNÇÃO CENTRAL DE IMAGEM
// =========================

function processImage(chatId, fileUniqueId) {
  console.log("Imagem recebida:", fileUniqueId);

  for (const key in imageDatabase) {
    if (fileUniqueId === imageDatabase[key].uniqueId) {
      return bot.sendPhoto(
        chatId,
        `${URL}/assets/${imageDatabase[key].file}`,
        { caption: imageDatabase[key].caption }
      );
    }
  }

  bot.sendMessage(chatId, "Essa imagem não possui significado.");
}

// =========================
// 🔹 RECEBER IMAGENS (PHOTO)
// =========================

bot.on("photo", (msg) => {
  const chatId = msg.chat.id;
  const photo = msg.photo[msg.photo.length - 1];

  processImage(chatId, photo.file_unique_id);
});

// =========================
// 🔹 RECEBER IMAGENS (DOCUMENT)
// 🔹 Telegram Web envia assim
// =========================

bot.on("document", (msg) => {
  const chatId = msg.chat.id;
  const doc = msg.document;

  if (doc.mime_type && doc.mime_type.startsWith("image/")) {
    processImage(chatId, doc.file_unique_id);
  }
});

// =========================
// 🔹 HEALTH CHECK
// =========================

app.get("/", (req, res) => {
  res.send("Orion está operacional.");
});

// =========================
// 🔹 SERVIDOR
// =========================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
