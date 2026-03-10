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
`🚀 Bienvenido al Bot de Alertas Crypto

Comandos disponibles:

/precio btc
/precio eth
/alert btc 65000
/misalertas
/top`
  );
});


// PRECIO GENERICO
bot.onText(/\/precio (.+)/, async (msg, match) => {

  const chatId = msg.chat.id;
  const symbol = match[1].toUpperCase();

  const price = await getPrice(symbol);

  if (!price) {
    bot.sendMessage(chatId, "No pude obtener el precio.");
    return;
  }

  bot.sendMessage(chatId, `💰 ${symbol} actual: $${price}`);
});


// BTC
bot.onText(/\/btc/, async (msg) => {

  const price = await getPrice("BTC");

  bot.sendMessage(msg.chat.id, `💰 BTC actual: $${price}`);
});


// ETH
bot.onText(/\/eth/, async (msg) => {

  const price = await getPrice("ETH");

  bot.sendMessage(msg.chat.id, `💰 ETH actual: $${price}`);
});


// CREAR ALERTA
bot.onText(/\/alert (.+)/, async (msg, match) => {

  const chatId = msg.chat.id;

  const params = match[1].split(" ");

  const symbol = params[0].toUpperCase();
  const price = parseFloat(params[1]);

  if (!symbol || !price) {
    bot.sendMessage(chatId, "Uso correcto:\n/alert btc 65000");
    return;
  }

  const currentPrice = await getPrice(symbol);

  addAlert(chatId, symbol, price);

  bot.sendMessage(
    chatId,
`✅ Alerta creada

Crypto: ${symbol}
Precio actual: $${currentPrice}
Alerta en: $${price}`
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

    message += `${index + 1}. ${a.symbol} → $${a.price}\n`;

  });

  bot.sendMessage(chatId, message);
});


// TOP CRYPTOS
bot.onText(/\/top/, async (msg) => {

  const chatId = msg.chat.id;

  try {

    const response = await axios.get(
      "https://api.binance.com/api/v3/ticker/24hr"
    );

    const top = response.data
      .filter(c => c.symbol.endsWith("USDT"))
      .sort((a,b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
      .slice(0,5);

    let message = "🔥 TOP CRYPTOS 24H\n\n";

    top.forEach(c => {

      const symbol = c.symbol.replace("USDT","");

      message += `${symbol}  +${parseFloat(c.priceChangePercent).toFixed(2)}%\n`;

    });

    bot.sendMessage(chatId,message);

  } catch(err){

    bot.sendMessage(chatId,"Error obteniendo datos del mercado.");

  }

});


// VERIFICAR ALERTAS
setInterval(async () => {

  const alerts = getAlerts();

  const symbols = [...new Set(alerts.map(a => a.symbol))];

  const prices = {};

  for (const symbol of symbols) {

    const price = await getPrice(symbol);

    if (price) prices[symbol] = price;

  }

  for (const alert of alerts) {

    if (alert.triggered) continue;

    const price = prices[alert.symbol];

    if (!price) continue;

    if (price <= alert.price) {

      bot.sendMessage(
        alert.chatId,
`🚨 ALERTA CRYPTO 🚨

${alert.symbol} alcanzó tu precio objetivo

Precio actual: $${price}
Precio alerta: $${alert.price}`
      );

      alert.triggered = true;

    }

  }

}, 60000);

const http = require("http");

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Crypto bot running");
}).listen(PORT, () => {
  console.log("Server running on port", PORT);
});