require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const { getPrice } = require("./price.service");
const { addAlert, getAlerts, getAlertsByChatId } = require("./alerts.service");

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  polling: true,
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `🚀 Bienvenido al Bot de Alertas Crypto\n\nComandos disponibles:\n/precio_btc\n/precio_eth\n/alert_btc 65000\n/misalertas\n/top`
  );
});

// PRECIO GENERICO
bot.onText(/\/precio_(.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const symbol = match[1].toUpperCase();
  const price = await getPrice(symbol);

  if (!price) {
    bot.sendMessage(chatId, `❌ No pude obtener el precio de ${symbol}. Asegúrate de usar el nombre correcto (ej: bitcoin, ethereum).`);
    return;
  }

  bot.sendMessage(chatId, `💰 ${symbol} actual: $${price}`);
});

// ACCESOS DIRECTOS BTC/ETH
bot.onText(/\/btc/, async (msg) => {
  const price = await getPrice("BTC");
  bot.sendMessage(msg.chat.id, `💰 BTC actual: $${price}`);
});

bot.onText(/\/eth/, async (msg) => {
  const price = await getPrice("ETH");
  bot.sendMessage(msg.chat.id, `💰 ETH actual: $${price}`);
});

// CREAR ALERTA
bot.onText(/\/alert_(.+) (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const symbol = match[1].toUpperCase();
  const targetPrice = parseFloat(match[2]);

  if (isNaN(targetPrice)) {
    bot.sendMessage(chatId, "❌ Precio inválido. Uso: /alert_btc 65000");
    return;
  }

  const currentPrice = await getPrice(symbol);
  addAlert(chatId, symbol, targetPrice);

  bot.sendMessage(
    chatId,
    `✅ Alerta creada\n\nCrypto: ${symbol}\nPrecio actual: $${currentPrice || 'Desconocido'}\nAlerta en: $${targetPrice}`
  );
});

// VER ALERTAS
bot.onText(/\/misalertas/, (msg) => {
  const chatId = msg.chat.id;
  const userAlerts = getAlertsByChatId(chatId);

  if (userAlerts.length === 0) {
    bot.sendMessage(chatId, "No tienes alertas activas.");
    return;
  }

  let message = "📊 Tus alertas activas:\n\n";
  userAlerts.forEach((a, index) => {
    message += `${index + 1}. ${a.symbol} → $${a.price} ${a.triggered ? '🔔' : '⏳'}\n`;
  });

  bot.sendMessage(chatId, message);
});

// TOP CRYPTOS (BINANCE)
bot.onText(/\/top/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const response = await axios.get("https://api.binance.com/api/v3/ticker/24hr");
    const top = response.data
      .filter(c => c.symbol.endsWith("USDT"))
      .sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
      .slice(0, 5);

    let message = "🔥 TOP CRYPTOS 24H (Binance)\n\n";
    top.forEach(c => {
      const symbol = c.symbol.replace("USDT", "");
      message += `${symbol}: +${parseFloat(c.priceChangePercent).toFixed(2)}%\n`;
    });
    bot.sendMessage(chatId, message);
  } catch (err) {
    bot.sendMessage(chatId, "Error obteniendo datos del mercado.");
  }
});

// VERIFICAR ALERTAS CADA 60 SEG
setInterval(async () => {
  const alerts = getAlerts();
  const symbols = [...new Set(alerts.filter(a => !a.triggered).map(a => a.symbol))];

  const prices = {};
  for (const symbol of symbols) {
    const price = await getPrice(symbol);
    if (price) prices[symbol] = price;
  }

  for (const alert of alerts) {
    if (alert.triggered) continue;
    const currentPrice = prices[alert.symbol];
    if (!currentPrice) continue;

    // Lógica simple: si el precio actual cruza el objetivo (hacia arriba o hacia abajo)
    if ((currentPrice >= alert.price)) { 
      bot.sendMessage(
        alert.chatId,
        `🚨 ALERTA CRYPTO 🚨\n\n${alert.symbol} alcanzó los $${currentPrice}\nTu objetivo era: $${alert.price}`
      );
      alert.triggered = true;
    }
  }
}, 60000);

const express = require('express');
const app = express();

// Render define la variable PORT automáticamente
const port = process.env.PORT || 10000; 

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

// IMPORTANTE: Escuchar en '0.0.0.0'
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});