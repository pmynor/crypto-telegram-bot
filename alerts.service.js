const alerts = [];

function addAlert(chatId, symbol, price) {
  alerts.push({
    chatId,
    symbol,
    price,
    triggered: false,
  });
}

function getAlerts() {
  return alerts;
}

function getAlertsByChatId(chatId) {
  return alerts.filter(a => a.chatId === chatId);
}

module.exports = { addAlert, getAlerts, getAlertsByChatId };

