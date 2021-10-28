let funStartPingBith = (ws, name) => {
  let timeNaw = new Date().getTime();
  console.log('This  Ping start timeNaw=', timeNaw);
  ws.send(JSON.stringify({ "cmd": "ping" }));
  console.log('name=', name);
};

module.exports = { funStartPingBith }
