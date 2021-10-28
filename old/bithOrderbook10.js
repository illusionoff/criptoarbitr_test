
const fetch = require('node-fetch');
const fs = require("fs");
const config = require('config');
const ReconnectingWebSocket = require('reconnecting-websocket');
const WS = require('ws');

const { goTrade, changeTradeArr, reconnectBithClosure } = require('../functions/functions');

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
let countErrors = 0;


let initialBith = {
  initialWs: false,
  initialFetchURL: false,
  messageObj: {},
  messageEdit: {},
  allOrderbookBuy: [],
  allOrderbookSell: [],
  ver: 0,
  orderbookFirstPreviousBuy: undefined,
  orderbookFirstPreviousSell: undefined,
  buyOrSell: -1,
  priceAndComissionsBuy: 0,
  priceAndComissionsSell: 0,
  takerComissions: 0,
  makerComissions: 0,
  buy: undefined,
  sell: undefined,
  buySellTimestamp: undefined,
  buyQuantity: undefined,
  sellQuantity: undefined,
  status: 0,
  indexLeveragesOrderbookBuy: [],
  indexLeveragesOrderbookSell: []
}

function wsStartBithOrder10(cmd, args, initialGate, writableFiles) {
  const params = JSON.stringify({
    "cmd": cmd,
    "args": [args]
  });

  // let wsSendPing = setInterval(() => {
  //   console.log('ping');
  //   ws.send(JSON.stringify({ "cmd": "ping" }));
  // }, 10000);


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

  function correctTimeServerClosure(colMessage) {
    let count = 0;
    let arrTimesPingPong = [];
    let timePing;
    let code00001 = false;
    if (initialBith.messageObj.code && initialBith.messageObj.code === '00001') {
      console.log('code00001=', code00001);
      code00001 = true;
      process.exit();

    }
    console.log(' correctTimeServerClosure initialBith=', initialBith);

    console.log('code00001=', code00001);
    // process.exit();
    // разогрев для подсчета синхронизации времени
    function timeServer(colMessage) {
      // if (colMessage > 3) {
      if (code00001 === true) {
        if (count < 11) {
          // отправка первого сообщения Ping
          if (count === 0) {
            ws.send(JSON.stringify({ "cmd": "ping" }));
            timePing = new Date().getTime();
            console.log(`!Pong synchronization  first time count=${count}`);// пришел ответ Pong

          }
          if (initialBith.messageObj.code && initialBith.messageObj.code === '0' &&
            initialBith.messageObj.msg && initialBith.messageObj.msg === 'Pong') {
            console.log(`!Pong synchronization time count=${count}`);// пришел ответ Pong
            let timePong = new Date().getTime();
            arrTimesPingPong.push([timePing, timePong]);
            // отправка последующих сообщений Ping
            ws.send(JSON.stringify({ "cmd": "ping" }));
            timePing = new Date().getTime();
            count++;
          }
        } else {
          // подсчет синхронизированного времени
          let arrTimes = arrTimesPingPong.map((elem) => {
            return Math.round((elem[1] - elem[0]) / 2);
          });
          let timeSync = Math.round(arrTimes.reduce((sum, current) => sum + current, 0) / 10);
          console.log(`arrTimes= ${arrTimes} timeSync = ${timeSync}`);
          process.exit();
        }
      }
    }
    return function (colMessage) {
      return timeServer(colMessage); // есть доступ к внешней переменной "count"
    };
  }

  let correctTimeServer = correctTimeServerClosure(colMessage);
  let reconnectBith = reconnectBithClosure(ws);

  // let testArr = [];
  // let testcount = 0;

  ws.onopen = function () {
    console.log('open');
    countReconnect++;
    console.log('countReconnect=', countReconnect);
    console.log('countReconnectCode0=', countReconnectCode0);
    ws.send(params);
    startPing(13000);
  };

  ws.onmessage = function (message) {
    console.log('BITHUMB message%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
    initialBith.messageObj = JSON.parse(message.data); //utf8Data  с сервера это строка преобразуем в объект
    console.log('initialBith.messageObj', initialBith.messageObj);
    if (initialBith.messageObj.error) {
      console.log('Reconnect error', console.messageObj.error);
      return ws.reconnect(1006, 'Reconnect error');
    }
    // запуск синхронизации времени
    // correctTimeServer(colMessage);

    if (initialBith.messageObj.code && initialBith.messageObj.code === '0' &&
      initialBith.messageObj.msg && initialBith.messageObj.msg === 'Pong') {
      console.log('!Pong1');// пришел ответ Pong
      // разогрев для подсчета синхронизации времени
    } else {
      // Не учитываем сообщения Pong
      timeNaw = new Date().getTime();
      console.log('timeNaw=', timeNaw);
      console.log('timeStart=', timeStart);
      colMessage++;
      // предотвращаем переполнения числа сообщений
      if (colMessage > 1000_000_000) colMessage = 1000_000_000;
      let varPeriod = timeNaw - timePrevious;
      // Во время теста Здесь вместо colMessage > 20    двадцати применить переменную которая зависит от результата функции синхронизации времени
      if (colMessage > 50 && varPeriod > maxTimePeriod) { maxTimePeriod = varPeriod }
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

    // Если ответ сервера code:"0" , reconnect
    if (!initialBith.messageObj.msg && initialBith.messageObj.code && initialBith.messageObj.code === '0') {
      console.log('!Reconnect code 0');
      countReconnectCode0++;
      return ws.reconnect(1006, 'initialBith.messageObj.code === 0');
    }
    if (initialBith.messageObj.code === "00007") {
      console.log('00007 initialBith.messageObj.data=', initialBith.messageObj.data);

      console.log('initialBith.messageObj.data=', initialBith.messageObj.data);
      initialBith.ver = Number(initialBith.messageObj.data.ver);
      initialBith.buySellTimestamp = initialBith.messageObj.timestamp;
      // // allOrderbookBuy = initialBith.messageObj.data.b.slice();
      // const length = initialBith.messageObj.data.b.length - 1;
      const length = 0;
      initialBith.buy = Number(initialBith.messageObj.data.b[length][0]);
      initialBith.sell = Number(initialBith.messageObj.data.s[length][0]);
      initialBith.initialWs = true;
      if (!Boolean(initialBith.orderbookFirstPreviousBuy)) {
        initialBith.orderbookFirstPreviousBuy = initialBith.buy;
      }
      if (!Boolean(initialBith.orderbookFirstPreviousSell)) {
        initialBith.orderbookFirstPreviousSell = initialBith.sell;
      }
      if (initialBith.orderbookFirstPreviousBuy && initialBith.orderbookFirstPreviousSell) {
        initialBith.globalFlag = true;
        console.log('initialBith.globalFlag = true');
        // process.exit();
      }
      console.log(' before sellBith: initialBith.priceAndComissionsSell=', initialBith.priceAndComissionsSell);
      console.log(' before makerComissions=', initialBith.makerComissions);
      console.log(' before initialBith=', initialBith);
      //  Если данные катировок изменились
      if (changeTradeArr(initialBith)) {
        console.log(' after sellBith: initialBith.priceAndComissionsSell=', initialBith.priceAndComissionsSell);
        console.log(' after sellBith: initialBith.priceAndComissionsBuy=', initialBith.priceAndComissionsBuy);
        const paramsGoTrade = {
          buyGate: initialGate.priceAndComissionsBuy,
          buyBith: initialBith.priceAndComissionsBuy,
          sellGate: initialGate.priceAndComissionsSell,
          sellBith: initialBith.priceAndComissionsSell,
          timeServer: new Date().getTime(),
          timeBith: initialBith.buySellTimestamp,
          timeGate: initialGate.timeGate,
          buyOrSellGate: initialGate.buyOrSell,
          buyOrSellBith: initialBith.buyOrSell,
          init: 1
        }
        // testcount++;
        // testArr.push(`${testcount}: ${initialBith.buy},${initialBith.sell}, ${paramsGoTrade.timeServer},  ${initialBith.ver}`);
        // console.log('initialBith.messageObj.data=', initialBith.messageObj.data);
        // console.log('testArr=', testArr);

        goTrade(paramsGoTrade, writableFiles);
      }

    }
    console.log('countReconnectCode0=', countReconnectCode0);
    console.log('countReconnect=', countReconnect);
    console.log('countErrors=', countErrors);
  }

  ws.onclose = function () {
    console.log('close');
    stopPing(); //?
  };
  ws.onerror = function (err) {
    console.log('error', err);
    countErrors++;
    stopPing();
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
