const axios = require("axios");

async function getPrice(symbol) {
  try {
    // Mapeo básico para CoinGecko
    const coins = { 
      'BTC': 'bitcoin', 
      'ETH': 'ethereum',
      'BNB': 'binancecoin',
      'SOL': 'solana'
    };
    
    const coinId = coins[symbol.toUpperCase()] || symbol.toLowerCase();

    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
    );

    // Verificamos que existan datos para evitar errores de undefined
    if (response.data[coinId]) {
      return response.data[coinId].usd;
    }
    return null;
  } catch (error) {
    console.error("Error en CoinGecko:", error.message);
    return null;
  }
}

// ESTA LÍNEA FALTABA:
module.exports = { getPrice };