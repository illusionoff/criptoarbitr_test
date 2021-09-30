

let funStartPingBith = (ws, name) => {
  let timeNaw = new Date().getTime();
  console.log('This  Ping start timeNaw=', timeNaw);
  ws.send(JSON.stringify({ "cmd": "ping" }));
  console.log('name=', name);
  // if (name === 'gate') process.exit()
  // if (name === 'bith') process.exit()
  // console.log('process.exit');
  // process.exit()
};

module.exports = { funStartPingBith }
