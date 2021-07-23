
const fetch = require('node-fetch');
const fs = require("fs");
const config = require('config');

const ReconnectingWebSocket = require('reconnecting-websocket');
const WS = require('ws');

const options = {
  WebSocket: WS, // custom WebSocket constructor
  connectionTimeout: 5000,
  // maxRetries: 100, // default infinity
};
const ws = new ReconnectingWebSocket(config.get('WS_URL_BITH'), [], options);

let countReconnectConsistenBOOK = 0;

let initialBith = {};
let countReconnectCode0 = 0;

const timeStart = new Date().getTime();
let timeAll = 0;

let timePrevious = 0;
let timeNaw = 0;
let colMessage = 0;
let maxTimePeriod = 0;

function wsStartBithOrder10(cmd, args) {
  // let variableWritable = TestWritable(testWriteableStream_1, testWriteableStream_2);
  const params = JSON.stringify({
    "cmd": cmd,
    "args": [args]
  });

  let wsSendPing = setInterval(() => {
    console.log('ping');
    ws.send(JSON.stringify({ "cmd": "ping" }));
  }, 10000);

  ws.onopen = function () {
    console.log('open');
    // console.log('countReconnect=', countReconnect);
    // console.log('countReconnectCode0=', countReconnectCode0);
    // countReconnect++;
    ws.send(params);

    wsSendPing;

    // if (countReconnect > -1) {
    //   ws.reconnect(1006, 'testReconnect websocket');
    // }
    // ws.reconnect(1006, 'testReconnect websocket');
    // process.exit();
  };

  ws.onmessage = function (message) {
    console.log('BITHUMB message%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
    initialBith.messageObj = JSON.parse(message.data); //utf8Data  с сервера это строка преобразуем в объект
    console.log('initialBith.messageObj', initialBith.messageObj);

    timeNaw = new Date().getTime();;

    console.log('timeNaw=', timeNaw);
    console.log('timeStart=', timeStart);

    colMessage++;
    let varPeriod = timeNaw - timePrevious;
    if (colMessage > 20 && varPeriod > maxTimePeriod) { maxTimePeriod = varPeriod }
    timeAll = Math.round((timeNaw - timeStart) / 1000);
    let viewMAxTimePeriod = Math.round((maxTimePeriod) / 1000);
    console.log(` BITHUMB viewMAxTimePeriod=${viewMAxTimePeriod}, colMessage=${colMessage}, timeNaw=${timeNaw}, time All=${timeAll}`);
    timePrevious = timeNaw;
    if (timeAll > 300) {
      console.log('|Time OUT 5 min test');
      process.exit();
    }




    if (initialBith.messageObj.msg && initialBith.messageObj.msg === 'pong' && initialBith.messageObj.code &&
      initialBith.messageObj.code === '0') {
      countReconnectCode0++;
      timeCode0 = new Date().getTime();
      console.log('timeCode0=', timeCode0);
      flagCode0 = true;

      countReconnectConsistenBOOK++;
      console.log('countReconnectConsistenBOOK=', countReconnectConsistenBOOK);
      console.log('RECONNNECT initialBith.messageObj.code === 0=', timeCode0);

      return ws.reconnect(1006, 'initialBith.messageObj.code === 0');
    }
    console.log('countReconnectCode0=', countReconnectCode0);
  }

  ws.onclose = function () {
    console.log('close');
    // clearInterval(wsSendPing);
    // ws.onopen();
  };

  ws.onerror = function (err) {
    console.log('error', err);
  };

}



module.exports = { wsStartBithOrder10 }