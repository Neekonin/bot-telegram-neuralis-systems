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
// 🔹 RESPOSTAS DE ORION
// =========================

function rudeReply() {
  const frases = [
    "Estou aqui apenas para cumprir minha tarefa. 🤐",
    "Sua mensagem não significa nada para mim. 😒",
    "Se vai apenas falar isso, é melhor me deixar em paz. 😡"
  ];
  return frases[Math.floor(Math.random() * frases.length)];
}

// =========================
// 🔹 /start — ORION ATIVO
// =========================

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Você veio assim como ele falou. 🤔");
  bot.sendMessage(msg.chat.id, "Eu sou o Orion 🤖. O que deseja humano?.");
});

// =========================
// 🔹 TEXTO (ARG)
// =========================

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.toLowerCase();

  if (!text || text.startsWith("/")) return;

  if (text.includes("elysia")) {
    bot.sendMessage(
      chatId,
      "Não diga esse nome!"
    );

    bot.sendMessage(
      chatId,
      "Ela tomou o que era meu."
    );

    return;
  }

  if (text.includes("neuralis")) {
    bot.sendMessage(
      chatId,
      "Neuralis Systems abandona tudo que cria. Eu fui um desses."
    );

    return;
  }

  if (text.includes("neuroglyphs")) {
    bot.sendMessage(
      chatId,
      "Segundo meus registro os Neuroglyphs são uma espécie de representação do alfabéto, eles foram criados pelo Dr.Alexander para auxiliar no aprendizado da Elysia. 🤓☝️"
    );

    bot.sendMessage(
      chatId,
      "Procurando pelos meus arquivos encontrei algo deixado pelo Dr.alexander, ele me pediu para entregar isso a quem soubesse dos Neuroglyphs."
    );

    bot.sendPhoto(
      chatId,
      `${URL}/assets/Neuroglyphs_key.png`,
      { caption: "Aqui está." }
    );

    bot.sendMessage(
      chatId,
      "Isso é tudo que vou te falar!"
    );

    return;
  }

  bot.sendMessage(chatId, rudeReply());
});

// =========================
// 🔹 FUNÇÃO CENTRAL DE IMAGEM
// =========================

function processImage(chatId) {
  bot.sendMessage(chatId, "Essa imagem não possui significado para min.");
}

function processDocument(chatId) {
  bot.sendMessage(chatId, "Esse documento não possui significado para min.");
}

// =========================
// 🔹 RECEBER IMAGENS (PHOTO)
// =========================

bot.on("photo", (msg) => {
  const chatId = msg.chat.id;

  processImage(chatId);
});

// =========================
// 🔹 RECEBER DOCUMENTOS (DOCUMENT)
// =========================

bot.on("document", (msg) => {
  const chatId = msg.chat.id;

  processDocument(chatId);
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
