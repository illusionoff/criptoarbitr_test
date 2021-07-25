
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

let countReconnectCode0 = 0;
let countReconnect = -1;

const timeStart = new Date().getTime();
let timeAll = 0;

let timePrevious = 0;
let timeNaw = 0;
let colMessage = 0;
let maxTimePeriod = 0;


let initialBith = {
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
  bayQuantity: undefined,
  sellQuantity: undefined,
  status: 0,
  indexLeveragesOrderbookBay: [],
  indexLeveragesOrderbookSell: []
}
function wsStartBithOrder10(cmd, args) {
  // let variableWritable = TestWritable(testWriteableStream_1, testWriteableStream_2);
  const params = JSON.stringify({
    "cmd": cmd,
    "args": [args]
  });

  // let wsSendPing = setInterval(() => {
  //   console.log('ping');
  //   ws.send(JSON.stringify({ "cmd": "ping" }));
  // }, 10000);
  let ping;

  function startPing() {
    ping = setInterval(function () {
      console.log('ping');
      console.log('new', new Date().getTime());
      ws.send(JSON.stringify({ "cmd": "ping" }));
    }, 10000);
  }

  function stopPing() {
    clearInterval(ping);
  }

  ws.onopen = function () {
    console.log('open');
    countReconnect++;
    console.log('countReconnect=', countReconnect);
    console.log('countReconnectCode0=', countReconnectCode0);
    // countReconnect++;
    ws.send(params);

    startPing();

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
    timeNaw = new Date().getTime();

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

    // if (initialBith.messageObj.code && initialBith.messageObj.code === '0') {

    // }

    if (initialBith.messageObj.code && initialBith.messageObj.code === '0' &&
      initialBith.messageObj.msg && initialBith.messageObj.msg === 'Pong') {
      console.log('!Pong1');
      // process.exit();
    }

    if (!initialBith.messageObj.msg && initialBith.messageObj.code && initialBith.messageObj.code === '0') {
      console.log('!Reconnect code 0');
      countReconnectCode0++;
      return ws.reconnect(1006, 'initialBith.messageObj.code === 0');
      // process.exit();
    }


    if (initialBith.messageObj.code === "00007") {
      initialBith.ver = Number(initialBith.messageObj.data.ver);
      allOrderbookBay = initialBith.messageObj.data.b.slice();
      allOrderbookSell = initialBith.messageObj.data.s.slice();
      orderbookFirstPreviousBay = allOrderbookBay[0].slice();



      initialBith.initialWs = true;
      if ((initialBith.bay != undefined) && (initialBith.sell != undefined) && initialGate.globalFlag) {
        const paramsGoTrade = {
          bayGate: initialGate.priceAndComissionsBay,
          bayBith: initialBith.priceAndComissionsBay,
          sellGate: initialGate.priceAndComissionsSell,
          sellBith: initialBith.priceAndComissionsSell,
          timeServer: new Date().getTime(),
          timeBith: initialBith.baySellTimestamp,
          timeGate: initialGate.timeGate,
          bayOrSellGate: initialGate.bayOrSell,
          init: 1
        }

        // goTrade(paramsGoTrade, writableFiles);
      }

    }

    // return ws.reconnect(1006, 'initialBith.messageObj.code === 0');
    // console.log('new', Date().getTime());

    // if (!initialBith.messageObj.msg && !initialBith.messageObj.msg === 'pong' && initialBith.messageObj.code &&
    //   initialBith.messageObj.code === '0') {
    //   countReconnectCode0++;
    //   timeCode0 = new Date().getTime();
    //   console.log('timeCode0=', timeCode0);
    //   flagCode0 = true;

    //   countReconnectConsistenBOOK++;
    //   console.log('countReconnectConsistenBOOK=', countReconnectConsistenBOOK);
    //   console.log('RECONNNECT initialBith.messageObj.code === 0=', timeCode0);

    //   return ws.reconnect(1006, 'initialBith.messageObj.code === 0');
    // }
    console.log('countReconnectCode0=', countReconnectCode0);
    console.log('countReconnect=', countReconnect);
  }

  ws.onclose = function () {
    console.log('close');
    stopPing();
    // ws.onopen();
  };

  ws.onerror = function (err) {
    console.log('error', err);
  };

}

async function coinConfigBith() {
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
    // console.log('data.data.coinConfig:', data.data.coinConfig);
    // console.log('urlSMS получено response.coinConfig:', JSON.stringify(response));//{"size":0,"timeout":0}
    console.log('response.status:', response.status);//{"size":0,"timeout":0}
    // console.log('response.data:', response);//{
    // console.log('urlSMS получено response.coinConfig:', response);//{"size":0,"timeout":0}

    // console.log('data.data.spotConfig:', data.data.spotConfig);
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
  }
}

module.exports = { wsStartBithOrder10, initialBith, coinConfigBith }
