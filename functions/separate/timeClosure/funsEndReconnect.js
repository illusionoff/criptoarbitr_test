let funEndPing = () => {
  let timeNaw = new Date().getTime();
  console.log('This Ping End timeNaw=', timeNaw);
};

let funStartReconnect = (ws) => {
  return ws.reconnect(1006, 'Reconnect error');
};

module.exports = { funEndPing, funStartReconnect }
