const fetch = require('node-fetch');
const fs = require("fs");
const { goTrade, reconnectBithClosure } = require('../functions/functions');
const config = require('config');

const ReconnectingWebSocket = require('reconnecting-websocket');
const WS = require('ws');
const { exit } = require('process');
// const WebSocket = require('ws');
// test
let countReconnectConsistenBOOK = 0;

let flagCode0 = false;
let timeCode0 = new Date().getTime();
let timePreviousCode0 = 0;
// let timeNaw = 0;
// let colMessage = 0;
let maxTimePeriodCode0 = 0;
let arrTimeOverCode0 = [];
let countOverCode0 = 0;


let arrTimeOver00006 = [];
let countOver00006 = 0;
let flag00006 = false;
let time00006 = new Date().getTime();
// let time00007 = new Date().getTime();

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
  bayQuantity: undefined,
  sellQuantity: undefined,
  status: 0,
  indexLeveragesOrderbookBay: [],
  indexLeveragesOrderbookSell: []
}

const options = {
  WebSocket: WS, // custom WebSocket constructor
  connectionTimeout: 5000,
  // maxRetries: 100, // default infinity
};
const ws = new ReconnectingWebSocket(config.get('WS_URL_BITH'), [], options);
// const rws = new ReconnectingWebSocket(config.get('WS_URL_BITH'));
// Создаем начальные массивы для собра статистики
initialBith.indexLeveragesOrderbookBay.length = 50;
initialBith.indexLeveragesOrderbookBay.fill(0);
initialBith.indexLeveragesOrderbookSell.length = 50;
initialBith.indexLeveragesOrderbookSell.fill(0);
// console.log('Initial indexLeveragesOrderbookBay=', initialBith.indexLeveragesOrderbookBa);
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
  // для тестов записи в файл  убираю функционал проверки изменения первого элемента
  // console.log('Orderbook=', Orderbook);
  // console.log('OrderbookNow[0]=', OrderbookNow[0]);
  // if (Orderbook[0] == OrderbookNow[0][0] && Orderbook[1] == OrderbookNow[0][1]) return false
  // // Orderbook[0] = OrderbookNow[0];

  // Orderbook[0] = OrderbookNow[0][0];
  // Orderbook[1] = OrderbookNow[0][1];
  // console.log('Orderbook 2=', Orderbook);
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
    ping = setInterval(function () {
      ws.send(JSON.stringify({ "cmd": "ping" }));
      let timeNaw = new Date().getTime();
      console.log('time ping bith======================================', timeNaw);
    }, time);
  }

  function stopPing() {
    clearInterval(ping);
  }

  let reconnectBith = reconnectBithClosure(ws);

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
      if (timeAll > 1800) {
        console.log('|Time OUT 5 min test');
        process.exit();
      }
      reconnectBith(); // если превышено время между сообщениями
    }

    if (initialBith.messageObj.code === "00006") {
      initialBith.ver = Number(initialBith.messageObj.data.ver);
      allOrderbookBay = initialBith.messageObj.data.b.slice();
      allOrderbookSell = initialBith.messageObj.data.s.slice();
      orderbookFirstPreviousBay = allOrderbookBay[0].slice();
      console.log('initialBith.messageObj.data.b.length=', initialBith.messageObj.data.b.length);
      console.log('initialBith.messageObj.data.s.length=', initialBith.messageObj.data.s.length);

      console.log('allOrderbookBay 00006 5  ***************************************************');
      for (let i = 0; i < 5; i++) {
        console.log(allOrderbookBay[i]);
        // console.log(allOrderbookSell[i]);
      }
      console.log('allOrderbookSell 00006 5  ***************************************************');
      for (let i = 0; i < 5; i++) {
        console.log(allOrderbookSell[i]);
        // console.log(allOrderbookSell[i]);
      }
      // process.exit();
      console.log('orderbookFirstPreviousBay 00006=', orderbookFirstPreviousBay);
      // orderbookFirstPreviousSell = Number(allOrderbookSell.slice(0, 1));
      console.log('TEST 00006 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');//для отладки себе включить
      time00006 = new Date().getTime();
      console.log('time00006=', time00006);
      flag00006 = true;
    }

    // console.log(counter + ':->' + Date.now() + ": Received: ");
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
      // process.exit();
      console.log('Delta time 00007 - 00006=======================', new Date().getTime() - time00006);

      if (flag00006) {
        // math
        let time00007 = new Date().getTime();
        timeDiff = time00007 - time00006;
        countOver00006++;
        arrTimeOver00006.push([countOver00006, timeDiff]);
        // console.log('arrTimeOver00006', arrTimeOver00006);
        flag00006 = false;
      }

      if (flagCode0) {
        // math
        let time00007 = new Date().getTime();
        timeDiff = time00007 - timeCode0;
        countOverCode0++;
        arrTimeOverCode0.push([countOverCode0, timeCode0, timeDiff]);
        // console.log('arrTimeOver00006', arrTimeOver00006);
        flagCode0 = false;
      }
      console.log('arrTimeOver00006', arrTimeOver00006);
      console.log('arrTimeOverCode0', arrTimeOverCode0);
      if (Number(initialBith.messageObj.data.ver) === initialBith.ver + 1) {
        initialBith.ver++;
        console.log('_____________________________________________________________TRUE');
        if (initialBith.messageObj.data.b.length > 1) {
          process.exit();
        }

        if (initialBith.messageObj.data.s.length > 1) {
          process.exit();
        }
        console.log('Было***************************************************');
        for (let i = 0; i < 5; i++) {
          console.log(allOrderbookBay[i]);
          // console.log(allOrderbookSell[i]);
        }
        console.log('initialBith.messageObj.data.b:', initialBith.messageObj.data.b);//для отладки себе включить
        console.log('initialBith.messageObj.data.s:', initialBith.messageObj.data.s);//для отладки себе включить
        if (initialBith.messageObj.data.b.length === 1) orderbookChange(allOrderbookBay, initialBith.messageObj.data.b)
        if (initialBith.messageObj.data.s.length === 1) orderbookChange(allOrderbookSell, initialBith.messageObj.data.s)

        console.log('allOrderbookBay.length=((((((((((((((((((((((((((((((((((', allOrderbookBay.length);
        console.log('allOrderbookSell.length=((((((((((((((((((((((((((((((((((', allOrderbookSell.length);
        console.log('orderbookFirstPreviousBay', orderbookFirstPreviousBay);
        console.log('allOrderbookBay[0]', allOrderbookBay[0]);
        console.log('Стало***************************************************');
        for (let i = 0; i < 5; i++) {
          console.log(allOrderbookBay[i]);
          // console.log(allOrderbookSell[i]);
        }
        // console.log('changeFirstOrderbook=', changeFirstOrderbook(orderbookFirstPreviousBay, allOrderbookBay));
        if (orderbookFirstPreviousBay[0] == allOrderbookBay[0][0] && orderbookFirstPreviousBay[1] == allOrderbookBay[0][1]) {
          console.log('orderbookFirstPreviousBay==========================================', orderbookFirstPreviousBay);
          console.log('allOrderbookBay[0]=============================================', allOrderbookBay[0]);
          console.log('initialBith.messageObj.data.b=============================================', initialBith.messageObj.data.b);

        } else {
          console.log('orderbookFirstPreviousBay exit', orderbookFirstPreviousBay);
          // process.exit();
        }
        //  Проверяем изменился ли первый элемент ORDERBOOK на Bay и Sell
        if (changeFirstOrderbook(orderbookFirstPreviousBay, allOrderbookBay)) {
          initialBith.bay = Number(allOrderbookBay[0][0]);
          // не реализовано changeFirstOrderbook(orderbookFirstPreviousSell, allOrderbookSell)
          initialBith.sell = Number(allOrderbookSell[0][0]);

          // initialBith.bayTimestamp = initialBith.messageObj.timestamp;
          initialBith.bayQuantity = Number(allOrderbookBay[0][1]);
          initialBith.priceAndComissionsBay = initialBith.bay - initialBith.bay * initialBith.makerComissions;
          //   console.log('initialBith.priceAndComissionsBay', initialBith.priceAndComissionsBay);
          console.log('Стало***************************************************');
          for (let i = 0; i < 5; i++) {
            console.log(allOrderbookBay[i]);
            // console.log(allOrderbookSell[i]);
          }
          console.log('orderbookFirstPreviousBay exit=', orderbookFirstPreviousBay);
          // console.log('orderbookFirstPreviousSell exit=', orderbookFirstPreviousSell);
          console.log('Data first element ORDERBOOK changes Bay exit');
          // process.exit();

          initialBith.baySellTimestamp = initialBith.messageObj.timestamp;
          console.log(' initialBith.baySellTimestamp=', initialBith.baySellTimestamp);

          initialBith.initialWs = true;
          initialGate.globalFlag = true;
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
            goTrade(paramsGoTrade, writableFiles);
          }
        }

        if (initialBith.messageObj.data.b.length === 1) {
          const dataBay = Number(initialBith.messageObj.data.b[0][0]);
          console.log('dataBay=', dataBay);

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
      console.log('initialBith.messageObj:', initialBith.messageObj);
      console.log('---------------------------------------');
      console.log('initialBith.messageObj.code === 00007----------------------------------------------BITH');
      // была проблема с самим сервером Bithump, не отсылал сообщения 00007, поэтому делал альтернативный вариант




      // if (initialBith.messageObj.data.b.length>0 ) {
      // if (initialBith.messageObj.data.s === 'buy') {
      //   initialBith.bay = Number(initialBith.messageObj.data.p);
      //   initialBith.bayTimestamp = initialBith.messageObj.timestamp;
      //   initialBith.bayQuantity = Number(initialBith.messageObj.data.v);
      //   console.log('initialBith.messageObj.data.p', initialBith.messageObj.data.p);
      //   console.log('initialBith.bay', initialBith.bay);
      //   console.log('initialBith.bayTimestamp', initialBith.bayTimestamp);
      //   console.log('initialBith.bayQuantity', initialBith.bayQuantity);
      //   console.log('initialBith.makerComissions', initialBith.makerComissions);
      //   initialBith.priceAndComissionsBay = initialBith.bay - initialBith.bay * initialBith.makerComissions;
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

      // if ((initialBith.bay != undefined) && (initialBith.sell != undefined) && (initialBith.bayQuantity != undefined) &&
      //  (initialBith.sellQuantity != undefined) && (initialBith.bayTimestamp != undefined) && (initialBith.sellTimestamp != undefined)) {
      //   initialBith.initialWs = true;
      // }
      console.log('initialBith.initialWs', initialBith.initialWs);
      // console.log('initialBith.messageObj.data.b.length:', initialBith.messageObj.data.b.length);//для отладки себе включить
      // console.log('initialBith.messageObj.data.s.length:', initialBith.messageObj.data.s.length);//для отладки себе включить

      console.log('Number initialBith.messageObj.data.b: ', initialBith.messageObj.data.b);//для отладки себе включить
      console.log('Number initialBith.messageObj.data.s:', initialBith.messageObj.data.s);//для отладки себе включить

      if (initialBith.messageObj.data.b.length > 0 && initialBith.messageObj.data.s.length > 0) { // если массив существует и заполнен, то считаем норм
        console.log('initialBith.messageObj.data.b.length > 0 && initialBith.messageObj.data.s.length > 0');
        initialBith.initialWs = true;
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

module.exports = { wsStartBith, initialBith, coinConfigBith }
// client.connect('wss://global-api.bithumb.pro/message/realtime');
