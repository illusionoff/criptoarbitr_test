const fetch = require('node-fetch');
const { goTrade, reconnectTimeMessageClosure, changeTradeArr, closureTimeStopTest, consoleGroupLog } = require('../functions/functions');
const config = require('config');

const ReconnectingWebSocket = require('reconnecting-websocket');
const WS = require('ws');

const TRACK_ELEMENT_ORDERBOOK = config.get('TRACK_ELEMENT_ORDERBOOK');
const TIME_STOP_TEST = config.get('TIME_STOP_TEST');
let arrTimeOverCode0 = [];
const timeStart = new Date().getTime();
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
    consoleGroupLog({ countReconnect, countErrors },
      ['BITHUMB message%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%']);
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
      timeStopTest(countReconnect, countErrors);
      reconnectTimeMessage(); // если превышено время между сообщениями
    }

    if (initialBith.messageObj.code === "00007") {
      initialBith.ver = Number(initialBith.messageObj.data.ver);
      consoleGroupLog({ 'time Naw My': new Date().getTime(), 'initialBith.messageObj.timestamp': initialBith.messageObj.timestamp, ver: initialBith.ver, arrTimeOverCode0 }, ['00007***************************************************'
      ]);
      if (initialBith.initialFetchURL) {
        // consoleGroupLog({
        //   takerComissionsBith: initialBith.takerComissions,
        //   makerComissionsBith: initialBith.makerComissions
        // }, ['initialBith.initialFetchURL= true']);
        const tetsConsoleLog = `initialBith.takerComissions = ${initialBith.takerComissions}\n
        initialBith.makerComissions = ${initialBith.makerComissions}\ninitialBith.initialFetchURL= true
      `;
        console.log(tetsConsoleLog)
        console.log('ABC'.charCodeAt(0));
        const index = tetsConsoleLog.indexOf('\n');
        console.log('n=', tetsConsoleLog.indexOf('\n'));
        console.log('2n=', tetsConsoleLog[tetsConsoleLog.indexOf('\n') - 1]);
        console.log('n+2=', tetsConsoleLog[tetsConsoleLog.indexOf('\n') + 2]);
        console.log('n+2code str=', tetsConsoleLog[tetsConsoleLog.indexOf('\n') + 2].charCodeAt(index));
        charCodeAt(index)
      }

      initialBith.bay = Number(initialBith.messageObj.data.b[TRACK_ELEMENT_ORDERBOOK][0]);
      initialBith.sell = Number(initialBith.messageObj.data.s[TRACK_ELEMENT_ORDERBOOK][0]);

      if (!Boolean(initialBith.orderbookFirstPreviousBay)) {
        initialBith.orderbookFirstPreviousBay = initialBith.bay;
      }
      if (!Boolean(initialBith.orderbookFirstPreviousSell)) {
        initialBith.orderbookFirstPreviousSell = initialBith.sell;
      }
      if (initialBith.orderbookFirstPreviousBay && initialBith.orderbookFirstPreviousSell) {
        initialBith.globalFlag = true;
        console.log('initialBith.globalFlag = true');
      }

      initialBith.initialWs = true;
      // initialGate.globalFlag = true;
      console.log(
        `It's Bith
      initialBith.orderbookFirstPreviousBay = ${initialBith.orderbookFirstPreviousBay}
      initialBith.bay = ${initialBith.bay}`
      )
      process.exit()
      if (initialGate.globalFlag && initialBith.globalFlag && initialBith.initialFetchURL && initialBith.initialWs) {
        initialBith.time = initialBith.messageObj.timestamp;
        console.log(' initialBith.baySellTimestamp=', initialBith.baySellTimestamp);
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
    console.log('data:', data);
    console.log('data.data.contractConfig:', JSON.stringify(data.data.contractConfig));
    console.log('typeof data.data.coinConfig:', typeof data.data.coinConfig);
    // let coinConfig = data.data.coinConfig.find(coin => coin.name === config.get("CURRENCY_NAME"))).fullName;
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
    console.log('data.data.contractConfig[0].makerFeeRate=', data.data.contractConfig[0].makerFeeRate);
    console.log('initialBith.makerComissions=', initialBith.makerComissions);
    console.log('Number(data.data.coinConfig[0].makerFeeRate)=', Number(data.data.coinConfig[0].makerFeeRate));
    console.log('Number(data.data.contractConfig[0].makerFeeRate)=', Number(data.data.contractConfig[0].makerFeeRate));

    initialBith.initialFetchURL = true;
  } catch (e) {
    initialBith.initialFetchURL = false;
    console.log('My error', e);
    coinConfigBith();
  }
}

module.exports = { wsStartBith, initialBith, coinConfigBith }
// client.connect('wss://global-api.bithumb.pro/message/realtime');
