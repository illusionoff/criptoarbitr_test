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
  buy: undefined,
  sell: undefined,
  buySellTimestamp: undefined,
  buyOrSell: -1,
  buyQuantity: undefined,
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
  //Определяем это данные buy или sell. Если первый элемент allOrderbook больше последующих - убывающая последовательность то это buy иначе sell
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
    console.log('countReconnectConsistenBOOK=', countReconnectConsistenBOOK);
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

    if (initialBith.messageObj.code === "00006") {
      initialBith.ver = Number(initialBith.messageObj.data.ver);
      initialBith.allOrderbookBay = initialBith.messageObj.data.b.slice();
      initialBith.allOrderbookSell = initialBith.messageObj.data.s.slice();
      //замена функционала на аналогичное как у Gate
      // orderbookFirstPreviousBay = allOrderbookBay[TRACK_ELEMENT_ORDERBOOK].slice();
      // orderbookFirstPreviousSell = allOrderbookBay[TRACK_ELEMENT_ORDERBOOK].slice();
      console.log('initialBith.messageObj.data.b.length=', initialBith.messageObj.data.b.length);
      console.log('initialBith.messageObj.data.s.length=', initialBith.messageObj.data.s.length);

    }

    if (initialBith.messageObj.code === "00007") {
      console.log('00007***************************************************');
      console.log('time Naw my=', new Date().getTime());
      console.log('initialBith.messageObj.timestamp=', initialBith.messageObj.timestamp);
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
      if (Number(initialBith.messageObj.data.ver) === initialBith.ver + 1) {
        initialBith.ver++;
        console.log('_____________________________________________________________TRUE');
        console.log('Было***************************************************Bay');
        // for (let i = 0; i < 10; i++) {
        //   console.log(allOrderbookBay[i]);
        //   // console.log(allOrderbookSell[i]);
        // }
        console.log('initialBith.allOrderbookBay[TRACK_ELEMENT_ORDERBOOK]=', initialBith.allOrderbookBay[TRACK_ELEMENT_ORDERBOOK]);

        console.log('Было***************************************************Sell');
        // for (let i = 0; i < 10; i++) {
        //   console.log(allOrderbookSell[i]);
        //   // console.log(allOrderbookSell[i]);
        // }
        console.log('initialBith.allOrderbookSell[TRACK_ELEMENT_ORDERBOOK]=', initialBith.allOrderbookSell[TRACK_ELEMENT_ORDERBOOK]);

        console.log('initialBith.messageObj.data.b:', initialBith.messageObj.data.b);//для отладки себе включить
        console.log('initialBith.messageObj.data.s:', initialBith.messageObj.data.s);//для отладки себе включить
        if (initialBith.messageObj.data.b.length === 1) orderbookChange(initialBith.allOrderbookBay, initialBith.messageObj.data.b)
        if (initialBith.messageObj.data.s.length === 1) orderbookChange(initialBith.allOrderbookSell, initialBith.messageObj.data.s)

        console.log('initialBith.allOrderbookBay.length=((((((((((((((((((((((((((((((((((', initialBith.allOrderbookBay.length);
        console.log('initialBith.allOrderbookSell.length=((((((((((((((((((((((((((((((((((', initialBith.allOrderbookSell.length);
        console.log('Стало***************************************************Bay');
        // for (let i = 0; i < 10; i++) {
        //   console.log(allOrderbookBay[i]);
        //   // console.log(allOrderbookSell[i]);
        // }
        console.log('initialBith.allOrderbookBay[TRACK_ELEMENT_ORDERBOOK]=', initialBith.allOrderbookBay[TRACK_ELEMENT_ORDERBOOK]);

        console.log('Стало***************************************************Sell');
        // for (let i = 0; i < 10; i++) {
        //   console.log(allOrderbookSell[i]);
        //   // console.log(allOrderbookSell[i]);
        // }
        console.log('initialBith.allOrderbookSell[TRACK_ELEMENT_ORDERBOOK]=', initialBith.allOrderbookSell[TRACK_ELEMENT_ORDERBOOK]);
        //отслеживаемый элемент ORDERBOOK
        // const trackElementOrderbookBay0 = allOrderbookBay[TRACK_ELEMENT_ORDERBOOK][0];
        // const trackElementOrderbookBay1 = allOrderbookBay[TRACK_ELEMENT_ORDERBOOK][1];
        // const trackElementOrderbookBay = allOrderbookBay[TRACK_ELEMENT_ORDERBOOK];

        // const trackElementOrderbookSell0 = allOrderbookSell[TRACK_ELEMENT_ORDERBOOK][0];
        // const trackElementOrderbookSell1 = allOrderbookSell[TRACK_ELEMENT_ORDERBOOK][1];
        // const trackElementOrderbookSell = allOrderbookSell[TRACK_ELEMENT_ORDERBOOK];
        // console.log('orderbookFirstPreviousBay', orderbookFirstPreviousBay);
        // console.log('orderbookFirstPreviousSell', orderbookFirstPreviousSell);
        // // console.log('changeFirstOrderbook=', changeFirstOrderbook(orderbookFirstPreviousBay, allOrderbookBay));
        // //  Проверяем изменился ли n-й (TRACK_ELEMENT_ORDERBOOK) элемент ORDERBOOK на Bay и Sell
        // const resultChangeOrderbookBay = changeFirstOrderbook(orderbookFirstPreviousBay, trackElementOrderbookBay);
        // const resultChangeOrderbookSell = changeFirstOrderbook(orderbookFirstPreviousSell, trackElementOrderbookSell);

        // // function objBayOrSell(resultChangeOrderbookBay, resultChangeOrderbookSell) {

        // //   orderbookFirstPreviousBay[0] = trackElementOrderbookBay0;
        // //   orderbookFirstPreviousBay[1] = trackElementOrderbookBay1;
        // //   initialBith.buy = Number(trackElementOrderbookBay0);
        // //   initialBith.buyQuantity = Number(trackElementOrderbookBay1);
        // //   initialBith.priceAndComissionsBay = initialBith.buy - initialBith.buy * initialBith.makerComissions;;
        // //   console.log('Стало***************************************************');
        // //   for (let i = 0; i < 10; i++) {
        // //     console.log(allOrderbookBay[i]);
        // //   }
        // //   console.log('orderbookFirstPreviousBay exit=', orderbookFirstPreviousBay);
        // //   console.log('Data first element ORDERBOOK changes Bay exit');
        // // }

        // if (resultChangeOrderbookBay) {
        //   orderbookFirstPreviousBay[0] = trackElementOrderbookBay0;
        //   orderbookFirstPreviousBay[1] = trackElementOrderbookBay1;
        //   initialBith.buy = Number(trackElementOrderbookBay0);
        //   initialBith.buyQuantity = Number(trackElementOrderbookBay1);
        //   initialBith.priceAndComissionsBay = initialBith.buy - initialBith.buy * initialBith.makerComissions;
        //   initialGate.buyOrSell =

        //     console.log('initialBith.buy=', initialBith.buy);
        //   console.log('initialBith.priceAndComissionsBay=', initialBith.priceAndComissionsBay);

        //   console.log('Стало***************************************************');
        //   for (let i = 0; i < 10; i++) {
        //     console.log(allOrderbookBay[i]);
        //   }

        //   console.log('orderbookFirstPreviousBay exit=', orderbookFirstPreviousBay);
        //   console.log('Data first element ORDERBOOK changes Bay exit');

        // }

        // if (resultChangeOrderbookSell) {
        //   orderbookFirstPreviousSell[0] = trackElementOrderbookSell0;
        //   orderbookFirstPreviousSell[1] = trackElementOrderbookSell1;
        //   initialBith.sell = Number(trackElementOrderbookSell0);
        //   initialBith.sellQuantity = Number(trackElementOrderbookSell1);
        //   initialBith.priceAndComissionsSell = initialBith.sell + initialBith.sell * initialBith.takerComissions;
        //   console.log('initialBith.sell=', initialBith.sell);
        //   console.log('initialBith.priceAndComissionsSell=', initialBith.priceAndComissionsSell);

        //   console.log('Стало***************************************************');
        //   for (let i = 0; i < 10; i++) {
        //     console.log(allOrderbookSell[i]);
        //   }
        //   console.log('orderbookFirstPreviousSell exit=', orderbookFirstPreviousSell);
        //   console.log('Data first element ORDERBOOK changes Bay exit');
        // }

        if (initialBith.initialFetchURL) {
          console.log('initialBith.initialFetchURL= true');
          console.log('initialBith.takerComissions=', initialBith.takerComissions);
          console.log('initialBith.makerComissions=', initialBith.makerComissions);

          // process.exit();
        }

        initialBith.buy = Number(initialBith.allOrderbookBay[TRACK_ELEMENT_ORDERBOOK][0]);
        initialBith.sell = Number(initialBith.allOrderbookSell[TRACK_ELEMENT_ORDERBOOK][0]);
        if (!Boolean(initialBith.orderbookFirstPreviousBay)) {
          initialBith.orderbookFirstPreviousBay = initialBith.buy;
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
        console.log('bithumbpro.js initialBith.buy=', initialBith.buy);
        console.log('It`s Bith');

        if (initialGate.globalFlag && initialBith.globalFlag && initialBith.initialFetchURL && initialBith.initialWs) {
          initialBith.time = initialBith.messageObj.timestamp;
          console.log(' initialBith.buySellTimestamp=', initialBith.buySellTimestamp);
          if (changeTradeArr(initialBith)) {
            const paramsGoTrade = {
              buyGate: initialGate.priceAndComissionsBay,
              buyBith: initialBith.priceAndComissionsBay,
              sellGate: initialGate.priceAndComissionsSell,
              sellBith: initialBith.priceAndComissionsSell,
              timeServer: new Date().getTime(),
              timeBith: initialBith.time,
              timeGate: initialGate.time,
              timeGateSell: initialGate.timeSell,
              timeGateBay: initialGate.timeBay,
              timeBithSell: initialBith.timeSell,
              timeBithBay: initialBith.timeBay,
              buyOrSellGate: initialGate.buyOrSell,
              buyOrSellBith: initialBith.buyOrSell,
              init: 0
            }
            return goTrade(paramsGoTrade, writableFiles);
          }
        }

        // if (changeFirstOrderbook(orderbookFirstPreviousSell, allOrderbookSell)) {
        //   initialBith.sell = Number(allOrderbookSell[0][0]);
        //   initialBith.sellQuantity = Number(allOrderbookSell[0][1]);
        //   initialBith.priceAndComissionsSell = initialBith.sell + initialBith.sell * initialBith.takerComissions;
        //   console.log('Data first element ORDERBOOK changes Sell');
        //   // process.exit();
        // }
      } else {
        countReconnectConsistenBOOK++;
        console.log('countReconnectConsistenBOOK=', countReconnectConsistenBOOK);
        return ws.reconnect(1006, 'initialBith.ver not matches')
      }

      // if (initialBith.messageObj.data.b.length>0 ) {
      // if (initialBith.messageObj.data.s === 'buy') {
      //   initialBith.buy = Number(initialBith.messageObj.data.p);
      //   initialBith.buyTimestamp = initialBith.messageObj.timestamp;
      //   initialBith.buyQuantity = Number(initialBith.messageObj.data.v);
      //   console.log('initialBith.messageObj.data.p', initialBith.messageObj.data.p);
      //   console.log('initialBith.buy', initialBith.buy);
      //   console.log('initialBith.buyTimestamp', initialBith.buyTimestamp);
      //   console.log('initialBith.buyQuantity', initialBith.buyQuantity);
      //   console.log('initialBith.makerComissions', initialBith.makerComissions);
      //   initialBith.priceAndComissionsBay = initialBith.buy - initialBith.buy * initialBith.makerComissions;
      //   console.log('initialBith.priceAndComissionsBay', initialBith.priceAndComissionsBay);
      // }

      // if (initialBith.messageObj.data.s === 'sell') {
      //   initialBith.sell = Number(initialBith.messageObj.data.p);
      //   initialBith.sellTimestamp = initialBith.messageObj.timestamp;
      //   initialBith.sellQuantity = Number(initialBith.messageObj.data.v);
      //   console.log('initialBith.messageObj.data.p', initialBith.messageObj.data.p);
      //   console.log('initialBith.sell', typeof initialBith.sell);
      //   console.log('initialBith.sellTimestamp', initialBith.sellTimestamp);
      //   console.log('initialBith.sellQuantity', initialBith.sellQuantity);
      //   console.log('initialBith.takerComissions', initialBith.takerComissions);
      //   console.log('initialBith.priceAndComissionsSell', initialBith.priceAndComissionsSell);
      //   initialBith.priceAndComissionsSell = initialBith.sell + initialBith.sell * initialBith.takerComissions;
      //   console.log('initialBith.priceAndComissionsSell', initialBith.priceAndComissionsSell);

      // }

      // if ((initialBith.buy != undefined) && (initialBith.sell != undefined) && (initialBith.buyQuantity != undefined) &&
      //  (initialBith.sellQuantity != undefined) && (initialBith.buyTimestamp != undefined) && (initialBith.sellTimestamp != undefined)) {
      //   initialBith.initialWs = true;
      // }
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
