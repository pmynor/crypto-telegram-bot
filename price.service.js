const axios = require("axios");

async function getPrice(symbol) {
  try {
    // CoinGecko usa nombres completos, pero podemos mapear los principales
    const coins = { 'BTC': 'bitcoin', 'ETH': 'ethereum' };
    const coinId = coins[symbol.toUpperCase()] || symbol.toLowerCase();

    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
    );

    return response.data[coinId].usd;
  } catch (error) {
    console.error("Error en CoinGecko:", error.message);
    return null;
  }
}