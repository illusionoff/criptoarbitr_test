const fetch = require('node-fetch');
const { goTrade, reconnectTimeMessageClosure, changeTradeArr, closureTimeStopTest, consoleLogGroup } = require('../functions/functions');
const config = require('config');

const ReconnectingWebSocket = require('reconnecting-websocket');
const WS = require('ws');

const TRACK_ELEMENT_ORDERBOOK = config.get('TRACK_ELEMENT_ORDERBOOK');
let countReconnect = -1;
let countErrors = 0;
let initialBith = {
  name: 'bith',
  initialWs: false,
  initialFetchURL: false,
  messageObj: {},
  messageEdit: {},
  allOrderbookBay: [],
  allOrderbookSell: [],
  ver: 0,
  orderbookFirstPreviousBay: undefined,
  orderbookFirstPreviousSell: undefined,
  priceAndComissionsBay: 0,
  priceAndComissionsSell: 0,
  takerComissions: 0,
  makerComissions: 0,
  bay: undefined,
  sell: undefined,
  baySellTimestamp: undefined,
  bayOrSell: -1,
  bayQuantity: undefined,
  sellQuantity: undefined,
  status: 0,
  indexLeveragesOrderbookBay: [],
  indexLeveragesOrderbookSell: [],
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
let ping;
function startPing(time) {
  clearInterval(ping);
  ping = setInterval(function () {
    ws.send(JSON.stringify({ "cmd": "ping" }));
    let timeNaw = new Date().getTime();
    console.log('time ping bith======================================', timeNaw);
  }, time);
}

function stopPing() {
  clearInterval(ping);
  console.log('stopPing');
}

function wsStartBith(cmd, args, initialGate, writableFiles) {
  const params = JSON.stringify({
    "cmd": cmd,
    "args": [args]
  });

  let timeStopTest = closureTimeStopTest();
  let reconnectTimeMessage = reconnectTimeMessageClosure(ws);

  ws.onopen = function () {
    console.log('open');
    console.log('countReconnect=', countReconnect);
    countReconnect++;
    ws.send(params);
    startPing(20000);
  };

  ws.onmessage = function (message) {
    const strCounts = `BITHUMB message%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    countReconnect = ${countReconnect}
    countErrors    = ${countErrors}
    `;
    consoleLogGroup(strCounts);
    initialBith.messageObj = JSON.parse(message.data); //utf8Data  с сервера это строка преобразуем в объект
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
      reconnectTimeMessage(); // если превышено время между сообщениями
    }

    if (initialBith.messageObj.code === "00007") {
      initialBith.ver = Number(initialBith.messageObj.data.ver);
      if (initialBith.initialFetchURL) {
        const strComissions = `initialBith.takerComissions = ${initialBith.takerComissions}
        initialBith.makerComissions = ${initialBith.makerComissions}
        initialBith.initialFetchURL= true
      `;
        consoleLogGroup(strComissions);
      }

      initialBith.bay = Number(initialBith.messageObj.data.b[TRACK_ELEMENT_ORDERBOOK][0]);
      initialBith.sell = Number(initialBith.messageObj.data.s[TRACK_ELEMENT_ORDERBOOK][0]);

      if (!Boolean(initialBith.orderbookFirstPreviousBay)) initialBith.orderbookFirstPreviousBay = initialBith.bay;
      if (!Boolean(initialBith.orderbookFirstPreviousSell)) initialBith.orderbookFirstPreviousSell = initialBith.sell;
      if (initialBith.orderbookFirstPreviousBay && initialBith.orderbookFirstPreviousSell) {
        initialBith.globalFlag = true;
        console.log('initialBith.globalFlag = true');
      }

      initialBith.initialWs = true;
      // initialGate.globalFlag = true;
      const strPrevious = `It's Bith
      initialBith.orderbookFirstPreviousBay = ${initialBith.orderbookFirstPreviousBay}
      initialBith.bay = ${initialBith.bay}`;
      consoleLogGroup(strPrevious);
      if (initialGate.globalFlag && initialBith.globalFlag && initialBith.initialFetchURL && initialBith.initialWs) {
        initialBith.time = initialBith.messageObj.timestamp;
        console.log(' initialBith.baySellTimestamp=', initialBith.baySellTimestamp);
        // if (changeTradeArr(initialBith)) {
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
        // }
      }
    }
  };

  ws.onclose = function () {
    initialBith.initialWs = false;
    console.log('close');
    stopPing();
  };

  ws.onerror = function (err) {
    initialBith.initialWs = false;
    console.log('error', err);
    countErrors++;
    stopPing();
  };
}

async function coinConfigBith() {
  console.log('coinConfigBith');

  try {
    const url = 'https://global-openapi.bithumb.pro/openapi/v1/spot/config';
    let response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log("response.ok:", response.ok);
    if (!response.ok) {
      // throw new Error(responseSMS.status); // 404
      console.log('responseSMS.status', responseSMS.status);
      // message = 'SMS:err ' + message;
      return
    }

    const data = await response.json();
    let coinConfig = data.data.coinConfig.find(coin => coin.name === config.get("CURRENCY_NAME"));
    console.log('coinConfigXRP:', coinConfig);
    console.log('response.status:', response.status);//{"size":0,"timeout":0}
    let spotConfigXRP = data.data.spotConfig.find(coin => coin.symbol === "XRP-USDT");
    console.log('data.data.spotConfig-XRP:', spotConfigXRP);
    // рассчитываем все комисии на taker - покупателя и maker - продавца
    initialBith.takerComissions = Number(data.data.contractConfig[0].takerFeeRate) + Number(data.data.coinConfig[0].takerFeeRate);
    console.log('data.data.coinConfig[0].takerFeeRate=', data.data.coinConfig[0].takerFeeRate)
    console.log('initialBith.takerComissions=', initialBith.takerComissions);
    initialBith.makerComissions = - (Number(data.data.contractConfig[0].makerFeeRate) - Number(data.data.coinConfig[0].makerFeeRate));
    const strContractConfig = `data.data.contractConfig[0].makerFeeRate = ${data.data.contractConfig[0].makerFeeRate}
    initialBith.makerComissions = ${initialBith.makerComissions}
    Number(data.data.coinConfig[0].makerFeeRate) = ${Number(data.data.coinConfig[0].makerFeeRate)}
    Number(data.data.contractConfig[0].makerFeeRate) = ${Number(data.data.contractConfig[0].makerFeeRate)}`
    consoleLogGroup(strContractConfig);
    initialBith.initialFetchURL = true;
  } catch (e) {
    initialBith.initialFetchURL = false;
    console.log('My error', e);
    coinConfigBith();
  }
}

module.exports = { wsStartBith, initialBith, coinConfigBith }
// client.connect('wss://global-api.bithumb.pro/message/realtime');
