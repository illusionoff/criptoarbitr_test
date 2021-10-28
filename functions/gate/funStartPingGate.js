let funStartPingGate = (ws, name) => {
  let time = new Date().getTime();
  console.log('This  Ping start time=', time);
  ws.send(JSON.stringify({ "time": time, "channel": "spot.ping" }));
  console.log('name=', name);
};

module.exports = { funStartPingGate }
