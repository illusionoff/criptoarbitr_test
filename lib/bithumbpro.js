const fetch = require('node-fetch');
const fs = require("fs");
const { goTrade, reconnectTimeMessageClosure, changeTradeArr } = require('../functions/functions');
const config = require('config');

const ReconnectingWebSocket = require('reconnecting-websocket');
const WS = require('ws');
const { exit } = require('process');
// const WebSocket = require('ws');
// test

const TRACK_ELEMENT_ORDERBOOK = config.get('TRACK_ELEMENT_ORDERBOOK');

let countReconnectConsistenBOOK = 0;
let arrTimeOverCode0 = [];
const timeStart = new Date().getTime();
let timeAll = 0;

let timePrevious = 0;
let timeNaw = 0;
let colMessage = 0;
let maxTimePeriod = 0;


let countReconnect = -1;
let countReconnectCode0 = -1;
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
// console.log(n.round(2));
// process.exit();
// const ws = new WebSocket(config.get('WS_URL_BITH'));

// {encoding: 'utf8', highWaterMark: 332 * 1024});// задать значение буфера

function indexOfTwoDimens(arr, value) {
  for (let i = 0; i < arr.length; i++) {
    // console.log(arr[i][0]);
    if (arr[i][0] === value) return i
  }
  return -1
}

function orderbookChange(allOrderbook, newMessage) {

  const index = indexOfTwoDimens(allOrderbook, newMessage[0][0]);
  // console.log('index=', index);
  if (index >= 0) {
    // Тест сбор статистики частоты использоваания индексов  сделок в Orderbook
    // if (index < 20) {
    //   if (BayOrSell) {
    //     let nawQuantity = initialBith.indexLeveragesOrderbookBay[index] + 1;
    //     initialBith.indexLeveragesOrderbookBay[index] = nawQuantity;
    //   } else {
    //     let nawQuantity = initialBith.indexLeveragesOrderbookSell[index] + 1;
    //     initialBith.indexLeveragesOrderbookSell[index] = nawQuantity;

    //   }
    // }
    //   console.log('indexLeveragesOrderbookBay====================', initialBith.indexLeveragesOrderbookBay);
    //   console.log('indexLeveragesOrderbookSell===================', initialBith.indexLeveragesOrderbookSell);
    //   //  удалить из массива этот элемент
    if (newMessage[0][1] === '0.000000') return allOrderbook.splice(index, 1)
    // заменить новым значением
    return allOrderbook[index][1] = newMessage[0][1];
  }
  // Если элемент не найден, то добавить в массив и упорядочить по убыванию либо возроастнию
  allOrderbook.push(newMessage[0]);
  //Определяем это данные bay или sell. Если первый элемент allOrderbook больше последующих - убывающая последовательность то это bay иначе sell
  if (allOrderbook[0][0] > allOrderbook[5][0]) return allOrderbook.sort((a, b) => Number(b[0]) - Number(a[0]))
  allOrderbook.sort((a, b) => Number(a[0]) - Number(b[0]));
}

function changeFirstOrderbook(Orderbook, OrderbookNow) {
  // для тестов записи в файл  убираю функционал проверки изменения 10 -го элемента
  console.log('Orderbook=', Orderbook);
  console.log('OrderbookNow[0]=', OrderbookNow[0]);
  if (Orderbook[0] == OrderbookNow[0] && Orderbook[1] == OrderbookNow[1]) return false
  // Orderbook[0] = OrderbookNow[0];

  // Orderbook[0] = OrderbookNow[0];
  // Orderbook[1] = OrderbookNow[1];
  console.log('Orderbook 2=', Orderbook);
  return true
}

function wsStartBith(cmd, args, initialGate, writableFiles) {
  let testTimeArr = [];
  let tesTimeCount = 0;
  const params = JSON.stringify({
    "cmd": cmd,
    "args": [args]
  });

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

  let reconnectTimeMessage = reconnectTimeMessageClosure(ws);

  ws.onopen = function () {
    console.log('open');
    console.log('countReconnect=', countReconnect);
    console.log('countReconnectCode0=', countReconnectCode0);
    countReconnect++;
    ws.send(params);
    startPing(20000);
  };

  ws.onmessage = function (message) {
    console.log('BITHUMB message%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
    console.log('countReconnect=', countReconnect);
    console.log('countReconnectCode0=', countReconnectCode0);
    console.log('countErrors=', countErrors);
    initialBith.messageObj = JSON.parse(message.data); //utf8Data  с сервера это строка преобразуем в объект
    if (initialBith.messageObj.error) {
      console.log('Reconnect error', console.messageObj.error);
      return ws.reconnect(1006, 'Reconnect error');
    }
    if (!initialBith.messageObj.msg && initialBith.messageObj.code && initialBith.messageObj.code === '0') {
      console.log('!Reconnect code 0');
      countReconnectCode0++;
      return ws.reconnect(1006, 'initialBith.messageObj.code === 0');
    }

    console.log('onmessage Gate initialBith.messageObj.timestamp=', initialBith.messageObj.timestamp);
    console.log('initialBith.messageObj:SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', initialBith.messageObj);
    console.log(`code= ${initialBith.messageObj.code}, msg = ${initialBith.messageObj.msg} `);

    if (initialBith.messageObj.code && initialBith.messageObj.code === '0' &&
      initialBith.messageObj.msg && initialBith.messageObj.msg === 'Pong') {
      console.log('!Pong1');
      // process.exit();
    } else {
      // Не учитываем сообщения Pong
      timeNaw = new Date().getTime();
      console.log('timeNaw=', timeNaw);
      console.log('timeStart=', timeStart);
      colMessage++;
      console.log('colMessage======================================================', colMessage);
      // предотвращаем переполнения числа сообщений
      if (colMessage > 1000_000_000) colMessage = 1000_000_000;

      let varPeriod = timeNaw - timePrevious;
      if (colMessage > 20 && varPeriod > maxTimePeriod) { maxTimePeriod = varPeriod }
      timeAll = Math.round((timeNaw - timeStart) / 1000);
      let viewMAxTimePeriod = Math.round((maxTimePeriod) / 1000);
      console.log(` BITHUMB viewMAxTimePeriod=${viewMAxTimePeriod}, colMessage=${colMessage}, timeNaw=${timeNaw}, time All=${timeAll}`);
      timePrevious = timeNaw;
      if (timeAll > 300) {
        // // тест
        // console.log('initialBith.allOrderbookBay');
        // for (let i = 0; i < 10; i++) {
        //   console.log(`allOrderbookBay[${i}]= ${initialBith.allOrderbookBay[i]}`);
        // }
        // console.log('initialBith.allOrderbookSell');
        // for (let i = 0; i < 10; i++) {
        //   console.log(`allOrderbookBay[${i}]= ${initialBith.allOrderbookSell[i]}`);
        // }
        console.log('|Time OUT 5 min test');
        // process.exit();
      }
      reconnectTimeMessage(); // если превышено время между сообщениями
    }

    if (initialBith.messageObj.code === "00007") {
      console.log('00007***************************************************');
      console.log('time Naw my=', new Date().getTime());
      console.log('initialBith.messageObj.timestamp=', initialBith.messageObj.timestamp);
      initialBith.ver = Number(initialBith.messageObj.data.ver);

      testTimeArr.push([new Date().getTime(), initialBith.messageObj.timestamp]);
      tesTimeCount++;
      if (tesTimeCount === 20) {
        console.log('Test Time Bith');
        console.log('testTimeArr=', testTimeArr);
        let arrTimeTest = testTimeArr.map((elem) => {
          return Math.round((elem[0] - elem[1]));
        });
        console.log('arrTimeTest разница=', arrTimeTest);
        // process.exit();
      }
      console.log('arrTimeOverCode0', arrTimeOverCode0);

      if (initialBith.initialFetchURL) {
        console.log('initialBith.initialFetchURL= true');
        console.log('initialBith.takerComissions=', initialBith.takerComissions);
        console.log('initialBith.makerComissions=', initialBith.makerComissions);

        // process.exit();
      }

      // initialBith.bay = Number(initialBith.allOrderbookBay[TRACK_ELEMENT_ORDERBOOK][0]);
      // initialBith.sell = Number(initialBith.allOrderbookSell[TRACK_ELEMENT_ORDERBOOK][0]);

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
        // process.exit();
      }
      // if ((resultChangeOrderbookBay || resultChangeOrderbookSell) && initialBith.initialFetchURL) {
      initialBith.initialWs = true;
      // initialGate.globalFlag = true;

      console.log('bithumbpro.js initialBith.orderbookFirstPreviousBay=', initialBith.orderbookFirstPreviousBay);
      console.log('bithumbpro.js initialBith.bay=', initialBith.bay);
      console.log('It`s Bith');

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
    // ws.onopen();
  };

  ws.onerror = function (err) {
    initialBith.initialWs = false;
    console.log('error', err);
    countErrors++;
    stopPing();
  };
}

// connection.send(JSON.stringify({ "cmd": "subscribe", "args": ["ORDERBOOK10:XRP-USDT"] }));

// wsStartBith('subscribe', "ORDERBOOK10:XRP-USDT");

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
    // return true
  } catch (e) {
    initialBith.initialFetchURL = false;
    console.log('My error', e);
    // return false
    coinConfigBith();
  }
}

module.exports = { wsStartBith, initialBith, coinConfigBith }
// client.connect('wss://global-api.bithumb.pro/message/realtime');
