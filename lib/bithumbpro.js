// const fetch = require('node-fetch');
const { goTrade, changeTradeArr, timeStopTestClosure, consoleLogGroup, timerClosure, funStartPingBith, funEndPing, funStartReconnect, coinConfigBith } = require('../functions/functions');
const config = require('config');

const ReconnectingWebSocket = require('reconnecting-websocket');
const WS = require('ws');

const TRACK_ELEMENT_ORDERBOOK = config.get('TRACK_ELEMENT_ORDERBOOK');
const VERSION = config.get('VERSION');
const TIMER_PING = config.get('TIMER_PING');
const TIMER_RECONNECT_MESSAGE = config.get('TIMER_RECONNECT_MESSAGE');


let countReconnect = -1;
let countErrors = 0;
let initialBith = {
  name: 'bith',
  initialFetchURL: false,
  messageObj: {},
  ver: 0,
  orderbookFirstPreviousBay: undefined,
  orderbookFirstPreviousSell: undefined,
  priceAndComissionsBay: 0,
  priceAndComissionsSell: 0,
  takerComissions: 0,
  makerComissions: 0,
  bay: undefined,
  sell: undefined,
  bayOrSell: -1,
  timeBay: undefined,
  timeSell: undefined,
  time: undefined,
}

const options = {
  WebSocket: WS, // custom WebSocket constructor
  connectionTimeout: 5000,
  // maxRetries: 100, // default infinity
};
const ws = new ReconnectingWebSocket(config.get('WS_URL_BITH'), [], options);
// функция округления
Number.prototype.round = function (places) {
  return +(Math.round(this + "e+" + places) + "e-" + places);
}
// var n = 1.7777;
// n.round(2); // 1.78 .round(comma)
const comma = 1;
// {encoding: 'utf8', highWaterMark: 332 * 1024});// задать значение буфера

function wsStartBith(cmd, args, initialGate, writableFiles) {
  const params = JSON.stringify({
    "cmd": cmd,
    "args": [args]
  });
  let timerConfigPing = {
    period: TIMER_PING, funStart: funStartPingBith, funEnd: funEndPing,
    funStartArguments: [ws, initialBith.name], funEndArguments: []
  };
  let timerConfigReconnect = {
    period: TIMER_RECONNECT_MESSAGE, funStart: funStartReconnect,
    funStartArguments: [ws], warming: 1
  };
  let timeStopTest = timeStopTestClosure();
  //если превышено время между сообщениями то реконнект
  let timerReconnectMessages = timerClosure(timerConfigReconnect);
  // let reconnectTimeMessage = reconnectTimeMessageClosure(ws);
  // периодическая отправка ping
  let timerPing = timerClosure(timerConfigPing);

  ws.onopen = function () {
    console.log('open');
    console.log('countReconnect=', countReconnect);
    countReconnect++;
    ws.send(params);
    timerPing.start();
  };

  ws.onmessage = function (message) {
    initialBith.messageObj = JSON.parse(message.data); //utf8Data  с сервера это строка преобразуем в объект
    consoleLogGroup`BITHUMB message%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    ${initialBith.messageObj}
    countReconnect = ${countReconnect}
    countErrors    = ${countErrors}`;
    if (initialBith.messageObj.error) {
      console.log('Reconnect error', console.messageObj.error);
      return ws.reconnect(1006, 'Reconnect error');
    }

    console.log(`code= ${initialBith.messageObj.code}, msg = ${initialBith.messageObj.msg} `);

    if (initialBith.messageObj.code && initialBith.messageObj.code === '0' &&
      initialBith.messageObj.msg && initialBith.messageObj.msg === 'Pong') {
      console.log('!Pong Bith');
    } else {
      // Не учитываем сообщения Pong
      timeStopTest({ countReconnect, countErrors, name: initialBith.name });
      // reconnectTimeMessage(); // если превышено время между сообщениями
      timerReconnectMessages.start();// если превышено время между сообщениями

    }

    if (initialBith.messageObj.code === "00007") {
      initialBith.ver = Number(initialBith.messageObj.data.ver);
      if (initialBith.initialFetchURL) {
        consoleLogGroup`initialBith.takerComissions = ${initialBith.takerComissions}
        initialBith.makerComissions = ${initialBith.makerComissions}
        initialBith.initialFetchURL= true
        Ver: ${VERSION}`;
      }

      initialBith.bay = Number(initialBith.messageObj.data.b[TRACK_ELEMENT_ORDERBOOK][0]);
      initialBith.sell = Number(initialBith.messageObj.data.s[TRACK_ELEMENT_ORDERBOOK][0]);
      console.log(' initialBith.bay=', initialBith.bay);
      console.log(' initialBith.sell=', initialBith.sell);
      if (!Boolean(initialBith.orderbookFirstPreviousBay)) initialBith.orderbookFirstPreviousBay = initialBith.bay;
      if (!Boolean(initialBith.orderbookFirstPreviousSell)) initialBith.orderbookFirstPreviousSell = initialBith.sell;
      if (initialBith.orderbookFirstPreviousBay && initialBith.orderbookFirstPreviousSell) {
        initialBith.globalFlag = true;
        console.log('initialBith.globalFlag = true');
      }

      // initialGate.globalFlag = true;
      consoleLogGroup`It's Bith
      initialBith.orderbookFirstPreviousBay = ${initialBith.orderbookFirstPreviousBay}
      initialBith.bay = ${initialBith.bay}
      Ver: ${VERSION}`;
      if (initialGate.globalFlag && initialBith.globalFlag && initialBith.initialFetchURL) {
        initialBith.time = initialBith.messageObj.timestamp;
        console.log(' initialBith.time=', initialBith.time);
        if (changeTradeArr(initialBith)) {
          const paramsGoTrade = {
            bayGate: initialGate.priceAndComissionsBay,
            bayBith: initialBith.priceAndComissionsBay,
            sellGate: initialGate.priceAndComissionsSell,
            sellBith: initialBith.priceAndComissionsSell,
            timeServer: new Date().getTime(),
            timeBith: initialBith.time,
            timeGate: initialGate.time,
            timeGateSell: initialGate.timeSell,
            timeGateBay: initialGate.timeBay,
            timeBithSell: initialBith.timeSell,
            timeBithBay: initialBith.timeBay,
            bayOrSellGate: initialGate.bayOrSell,
            bayOrSellBith: initialBith.bayOrSell,
            init: 0
          }
          goTrade(paramsGoTrade, writableFiles); // было return goTrade
        }
      }
    }
  };

  ws.onclose = function () {
    console.log('close');
    timerPing.stop();
  };

  ws.onerror = function (err) {
    console.log('error', err);
    countErrors++;
    timerPing.stop();
  };
}

module.exports = { wsStartBith, initialBith, coinConfigBith }
// client.connect('wss://global-api.bithumb.pro/message/realtime');
