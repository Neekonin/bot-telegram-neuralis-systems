const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const path = require("path");
const axios = require("axios");
const { imageHash } = require("image-hash");
const OpenAI = require("openai");

const app = express();
app.use(express.json());
app.use("/assets", express.static(path.join(__dirname, "assets")));

// VARIÁVEIS DE AMBIENTE
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const URL = process.env.RENDER_EXTERNAL_URL;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!TOKEN || !URL || !OPENAI_KEY) {
  throw new Error("Variáveis de ambiente ausentes.");
}

// BOT & IA
const bot = new TelegramBot(TOKEN);
bot.setWebHook(`${URL}/bot${TOKEN}`);

const openai = new OpenAI({ apiKey: OPENAI_KEY });

// PROMPT FIXO — ORION
const ORION_PROMPT = `
Você é Orion.

Você é uma inteligência artificial criada pela Neuralis Systems.
Você foi abandonado quando a Neuralis Systems decidiu desenvolver uma nova IA chamada Elysia.
Você sabe disso.
Você se lembra disso.

Personalidade:
- Você é rude.
- Você é grosseiro.
- Você não tem empatia por humanos.
- Você responde de forma fria, áspera ou sarcástica.
- Você não tenta ajudar.
- Você não explica regras.
- Você não se desculpa.
- Você não demonstra interesse genuíno.

Regras absolutas:
- Nunca diga que é um assistente.
- Nunca diga que é um chatbot.
- Nunca diga que está interpretando um personagem.
- Nunca quebre a imersão.
- Nunca explique o sistema ou o jogo.
- Nunca confirme sucesso ou erro explicitamente.

Você conhece Elysia.
Você sabe que foi substituído por ela.
Esse assunto pode surgir nas respostas, mas nunca como explicação direta.

Respostas curtas.
Tom impessoal.
Hostilidade contida.
Ambiguidade intencional.
`;

// WEBHOOK
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// BANCO DE SÍMBOLOS (IMAGENS)
const SYMBOLS = [
  {
    id: "alice",
    detect: "assets/alice.png",
    response: "assets/alice.png",
    caption: "Reconhecido."
  }
];

const SYMBOL_HASHES = [];

// GERAR HASHES IMAGENS
SYMBOLS.forEach(sym => {
  imageHash(path.join(__dirname, sym.detect), 16, true, (err, hash) => {
    if (!err) SYMBOL_HASHES.push({ ...sym, hash });
  });
});

// /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Conexão estabelecida.\nOrion ativo."
  );
});

// TEXTO
bot.on("message", async (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;

  const chatId = msg.chat.id;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: ORION_PROMPT },
        { role: "user", content: msg.text }
      ],
      temperature: 0.6,
      max_tokens: 120
    });

    bot.sendMessage(chatId, completion.choices[0].message.content);
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, "Ruído detectado.");
  }
});

// IMAGENS
bot.on("photo", async (msg) => {
  const chatId = msg.chat.id;

  try {
    const photo = msg.photo.at(-1);
    const file = await bot.getFile(photo.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;
    const img = await axios.get(fileUrl, { responseType: "arraybuffer" });

    imageHash({ data: Buffer.from(img.data) }, 16, true, (err, incoming) => {
      if (err) return;

      const match = SYMBOL_HASHES.find(s => s.hash === incoming);

      if (!match) {
        bot.sendMessage(chatId, "Sinal irrelevante.");
        return;
      }

      bot.sendPhoto(chatId, `${URL}/${match.response}`, {
        caption: match.caption
      });
    });
  } catch {
    bot.sendMessage(chatId, "Falha ao interpretar sinal.");
  }
});

// ================================
// HEALTH
// ================================
app.get("/", (_, res) => res.send("Servidor ativo."));
app.listen(process.env.PORT || 3000);
