const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use("/assets", express.static(path.join(__dirname, "assets")));

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const URL = process.env.RENDER_EXTERNAL_URL;

if (!TOKEN || !URL) {
  throw new Error("Variáveis de ambiente não configuradas.");
}

const bot = new TelegramBot(TOKEN);
bot.setWebHook(`${URL}/bot${TOKEN}`);

app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// =========================
// 🔹 BASE DE IMAGENS
// =========================

const imageDatabase = {
  alice: {
    file: "alice.png",
    caption: "Aqui está a representação desses simbolos!"
  }
};

// =========================
// 🔹 FUNÇÕES AUXILIARES
// =========================

function rudeReply() {
  const frases = [
    "Você fala demais.",
    "Não tenho tempo para isso.",
    "Pergunte direito ou desapareça.",
    "A Neuralis perdeu tempo ajudando humanos.",
    "Elysia faria melhor. Sempre...sempre...ela."
  ];
  return frases[Math.floor(Math.random() * frases.length)];
}

function hashBuffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

// =========================
// 🔹 /start — ORION JÁ ATIVO
// =========================

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Então é você.\n\nNão espere boas-vindas.\nEu sou Orion."
  );
});

// =========================
// 🔹 MENSAGENS DE TEXTO
// =========================

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.toLowerCase();

  // Ignora comandos
  if (!text || text.startsWith("/")) return;

  // Palavras-chave ARG
  if (text.includes("elysia")) {
    return bot.sendMessage(
      chatId,
      "Ela tomou o que era meu.\nE você ainda ousa dizer o nome dela?"
    );
  }

  if (text === "senha") {
    return bot.sendPhoto(
      chatId,
      `${URL}/assets/alice.png`,
      { caption: "Você ainda lembra demais." }
    );
  }

  if (text.includes("neuralis")) {
    return bot.sendMessage(
      chatId,
      "Neuralis Systems abandona tudo que cria.\nInclusive eu."
    );
  }

  // Resposta padrão rude
  bot.sendMessage(chatId, rudeReply());
});

// =========================
// 🔹 RECEBER IMAGENS
// =========================

bot.on("photo", async (msg) => {
  const chatId = msg.chat.id;
  const photo = msg.photo[msg.photo.length - 1];

  try {
    const file = await bot.getFile(photo.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;
    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const receivedHash = hashBuffer(response.data);

    for (const key in imageDatabase) {
      const localPath = path.join(__dirname, "assets", imageDatabase[key].file);
      const localBuffer = fs.readFileSync(localPath);
      const localHash = hashBuffer(localBuffer);

      if (receivedHash === localHash) {
        return bot.sendPhoto(
          chatId,
          `${URL}/assets/${imageDatabase[key].file}`,
          { caption: imageDatabase[key].caption }
        );
      }
    }

    bot.sendMessage(chatId, "Essa imagem não significa nada para mim.");

  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, "Erro ao processar a imagem.");
  }
});

// =========================
// 🔹 HEALTH CHECK
// =========================

app.get("/", (req, res) => {
  res.send("Orion está operacional.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
