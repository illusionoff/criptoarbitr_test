

// let funStartPing = (ws, name) => {
//   let timeNaw = new Date().getTime();
//   console.log('This  Ping start timeNaw=', timeNaw);
//   ws.send(JSON.stringify({ "cmd": "ping" }));
//   console.log('name=', name);
//   // if (name === 'gate') process.exit()
//   // if (name === 'bith') process.exit()
//   // console.log('process.exit');
//   // process.exit()

// };
let funEndPing = () => {
  let timeNaw = new Date().getTime();
  console.log('This Ping End timeNaw=', timeNaw);
};

let funStartReconnect = (ws) => {
  return ws.reconnect(1006, 'Reconnect error');
};

module.exports = { funEndPing, funStartReconnect }
