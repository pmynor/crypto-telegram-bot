//crypto-telegram-bot\price.service.js
const axios = require("axios");
async function getPrice(symbol) {
  try {
    const response = await axios.get(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`
    );
    return parseFloat(response.data.price);
  } catch (error) {
    // ESTO ES CLAVE: Mira qué dice el log de Render
    console.error(`Error en Binance API (${symbol}):`, error.response ? error.response.status : error.message);
    return null;
  }
}

module.exports = { getPrice };