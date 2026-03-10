const axios = require("axios");

async function getPrice(symbol) {
  try {
    const response = await axios.get(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`
    );

    return parseFloat(response.data.price);
  } catch (error) {
    return null;
  }
}

module.exports = { getPrice };