const moment = require('moment');
const WebSocket = require('ws');
const pako = require('pako');
const querystring = require('querystring');
const crypto = require('crypto');
const fs = require("fs");
const ReconnectingWebSocket = require('reconnecting-websocket');
const WS = require('ws');
const { goTrade } = require('../functions/functions');

const config = require('config');
// const { goTrade } = require('../functions/functions');
// const WS_URL = 'wss://ws.gateio.ws/v3/';
// const WS_URL = 'wss://ws.gateio.io/v3/';

let initialGate = {
  globalFlag: false, // Глобальный ключ готовности программы для основного цикла работы
  messageObj: {},
  messageEdit: {},
  messageRefresh: {},
  allOrderbookBay: [],
  allOrderbookSell: [],
  takerComissions: 0.002,
  makerComissions: 0.002,
  speedComissions: 0.002,
  priceAndComissionsBay: 1,
  priceAndComissionsSell: 1,
  bay: 0,
  sell: 0,
  ver: 0,
  bayOrSell: -1,
  bayTimestamp: undefined,
  sellTimestamp: undefined,
  bayQuantity: undefined,
  sellQuantity: undefined,
};

// const ws = new WebSocket(config.get("WS_URL_GATE"));


const options = {
  WebSocket: WS, // custom WebSocket constructor
  connectionTimeout: 5000,
  // maxRetries: 10,// default infinity
};
// const ws = new ReconnectingWebSocket(config.get('WS_URL_GATE'), [], options);
const ws = new ReconnectingWebSocket(config.get('WS_URL_GATE_v4'), [], options);
// const rws = new ReconnectingWebSocket(config.get('WS_URL_BITH'));
function getSign(str) {
  return crypto.createHmac('sha512', SECRET).update(str).digest().toString('base64');
}

const gateio = {
  // gateGet: function (id, method, params) {
  gateGet: function (time, channel, event, payload) {
    // const array = JSON.stringify({
    //   "id": id,
    //   "method": method,
    //   "params": params
    // });
    const array = JSON.stringify({
      // "time": Number(new Date().getTime()),
      // "channel": "spot.book_ticker", //book_ticker order_book_update
      // "event": "subscribe",
      // "payload": ["XRP_USDT"]//["XRP_USDT", "100ms"]
      // // "payload": ["XRP_USDT", "100ms"]

      "time": time,
      "channel": channel, //book_ticker order_book_update
      "event": event,
      "payload": payload//["XRP_USDT", "100ms"]
      // "payload": ["XRP_USDT", "100ms"]
    });
    ws.send(array);
  },
  // gateRequest: function (id, method, params) {
  //   const nonce = Math.round(new Date().getTime());
  //   params = [KEY, getSign(nonce + ""), nonce];
  //   const array = JSON.stringify({
  //     "id": id,
  //     "method": method,
  //     "params": params
  //   });
  //   ws.send(array);
  // },
}

function changeTrade(initialGate) {
  if (initialGate.messageObj.result.u > initialGate.ver) {
    initialGate.ver = initialGate.messageObj.result.u;
    if (initialGate.messageObj.result.b) {
      if (Number(initialGate.messageObj.result.b) != initialGate.bay) {
        initialGate.bayOrSell = 1;
        initialGate.bay = Number(initialGate.messageObj.result.b);
        // расчет учитывая комиссии + дополнительная комиссия за счет не самого лучшего значения ордеров speedComissions
        initialGate.priceAndComissionsBay = initialGate.bay - initialGate.bay * initialGate.takerComissions
          - initialGate.bay * initialGate.speedComissions;//  bay=bids это покупатели, клиенты продают самая выгодня цена для клиентов самая высокая, комиссию отнимаем
        console.log('Change bay:', initialGate.bay);
        console.log('initialGate.priceAndComissionsBay-------------------:', initialGate.priceAndComissionsBay);//для отладки себе включить

      }
    }
    if (initialGate.messageObj.result.a) {
      if (Number(initialGate.messageObj.result.a) != initialGate.sell) {
        initialGate.bayOrSell = 0;
        initialGate.sell = Number(initialGate.messageObj.result.a);
        // расчет учитывая комиссии + дополнительная комиссия за счет не самого лучшего значения ордеров speedComissions
        initialGate.priceAndComissionsSell = initialGate.sell + initialGate.sell * initialGate.makerComissions
          - initialGate.sell * initialGate.speedComissions; // sell=asks это продавцы, клиенты покупатели, самая выгодня цена для клиентов самая низкая, комиссию плюсуем
        console.log('Change sell:', initialGate.sell);
        console.log('initialGate.priceAndComissionsSell------------------:', initialGate.priceAndComissionsSell);//для отладки себе включить
      }
    }
  }
}

let methods;


// function wsGetGate(id, method, params, initialBith, writableFiles) {
function wsGetGate(time, channel, event, payload, initialBith, writableFiles) {
  // setInterval(() => { variableWritable() }, 100);

  ws.onopen = function () {
    gateio.gateGet(time, channel, event, payload);
    // console.log('open');
    // methods = method;
    // if (method == 'server.sign')
    //   gateio.gateRequest(id, method, params);
    // else if (method == 'order.query' || method == 'order.subscribe' || method == 'order.update' ||
    //   method == 'order.unsubscribe' || method == 'balance.query' || method == 'balance.subscribe' ||
    //   method == 'balance.update' || method == 'balance.unsubscribe') {
    //   gateio.gateRequest(id, 'server.sign', []);
    //   methods = 'server.sign';
    //   setTimeout(() => {
    //     gateio.gateGet(id, method, params);
    //     methods = "";
    //   }, 1000)
    // }
    // else
    // gateio.gateGet(id, method, params);
  };

  ws.onmessage = function (evt) {

    // variableWritable();
    // console.log('evt=', evt);//initialBith.messageObj
    initialGate.messageObj = JSON.parse(evt.data)
    // console.log('initialGate.messageObj==============================================', initialGate.messageObj);//initialBith.messageObj
    // console.log('initialGate.messageObj.event =', initialGate.messageObj.event);
    if (initialGate.messageObj.event == "update") {
      // console.log('Update initialGate.messageObj======================================', initialGate.messageObj);//initialBith.messageObj
      //     initialGate.priceAndComissionsBay = initialGate.bay - initialGate.bay * initialGate.takerComissions;//  bay=bids это покупатели, клиенты продают самая выгодня цена для клиентов самая высокая, комиссию отнимаем
      //     console.log('initialGate.priceAndComissionsBay:', initialGate.priceAndComissionsBay);//для отладки себе включить

      //     initialGate.priceAndComissionsSell = initialGate.sell + initialGate.sell * initialGate.makerComissions; // sell=asks это продавцы, клиенты покупатели, самая выгодня цена для клиентов самая низкая, комиссию плюсуем
      //     console.log('initialGate.priceAndComissionsSell:', initialGate.priceAndComissionsSell);//для отладки себе включить
      // if (initialGate.messageObj.params[1].asks && initialGate.messageObj.params[1].bids) {
      //   if (initialGate.messageObj.params[1].asks.length != 0 && initialGate.messageObj.params[1].bids.lengt != 0 &&
      //     initialGate.sell != undefined && initialGate.sell > 0 && initialGate.bay != undefined && initialGate.bay > 0) initialGate.globalFlag = true;
      // }
      if (initialGate.sell && initialGate.bay) initialGate.globalFlag = true;
      if (initialBith.initialFetchURL && initialBith.initialWs) { // если готовы данные из bithumb
        changeTrade(initialGate);
        initialGate.timeGate = initialGate.messageObj.result.t;
        const paramsGoTrade = {
          bayGate: initialGate.priceAndComissionsBay,
          bayBith: initialBith.priceAndComissionsBay,
          sellGate: initialGate.priceAndComissionsSell,
          sellBith: initialBith.priceAndComissionsSell,
          timeServer: new Date().getTime(),
          timeBith: initialBith.baySellTimestamp,
          timeGate: initialGate.timeGate,
          bayOrSellGate: initialGate.bayOrSell,
          init: 0,
        }

        // goTrade(paramsGoTrade, writableFiles);
      }

    }
    // process.exit();

    // console.log('typeof evt.data:', typeof evt.data);
    // initialGate.messageObj = JSON.parse(evt.data);//initialBith.messageObj
    // // console.log('initialGate.messageObj:', initialGate.messageObj);
    // console.log('initialGate.messageObj:', initialGate.messageObj);
    // if (initialGate.messageObj.params) {
    //   console.log('initialGate.globalFlag:', initialGate.globalFlag);

    //   if (initialGate.messageObj.params[0] === true) {
    //     initialGate.allOrderbookBay = initialGate.messageObj.params[1].bids;
    //     initialGate.allOrderbookSell = initialGate.messageObj.params[1].asks;
    //   }
    //   console.log('initialGate.allOrderbookBay=GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG', initialGate.allOrderbookBay);
    //   // console.log('initialGate.messageObj.params[1].bids=GGGGGGGGGGGGGGGGGGGGGGGGGGG', initialGate.messageObj.params[1].bids);
    //   // console.log('initialGate.messageObj.params[1].asks=GGGGGGGGGGGGGGGGGGGGGGGGGGG', initialGate.messageObj.params[1].asks);
    //   // TEST
    //   // initialGate.messageObj.params[1].asks = [['0.71873', '0']]; //// TEST
    //   // initialGate.messageObj.params[1].asks = []; //// TEST
    //   //  Удаляем элемениты массивов где количество 0
    //   if (initialGate.messageObj.params[1].asks) {
    //     //asks продавцы bids покупатели
    //     initialGate.messageObj.params[1].asks = initialGate.messageObj.params[1].asks.filter((number) => {
    //       return number[1] !== '0';
    //     });
    //     console.log('initialGate.messageObj.params[1].asks:', initialGate.messageObj.params[1].asks);
    //     console.log('initialGate.messageObj.params[1].asks.length:', initialGate.messageObj.params[1].asks.length);
    //     // initialGate.messageObj.params[1].asks.forEach((element, i, arr) => {
    //     //   arr[i] = String(Number(element[0]) + Number(element[0]) * initialGate.takerComissions)

    //     // });
    //   };
    //   // TEST
    //   // TEST
    //   // initialGate.messageObj.params[1].bids = [['0.71859', '1251.54']]; //// TEST
    //   if (initialGate.messageObj.params[1].bids) {
    //     initialGate.messageObj.params[1].bids = initialGate.messageObj.params[1].bids.filter((number) => {
    //       return number[1] !== '0';
    //     });
    //     // с учетом комиссий
    //     // initialGate.messageObj.params[1].bids.forEach((element, i, arr) => arr[i] = String(Number(element[0]) + Number(element[0]) * initialGate.makerComissions));

    //   };
    //   // console.log('initialGate.messageObj:', initialGate.messageObj);
    //   console.log('initialGate.messageObj.params[1]', initialGate.messageObj.params[1]);
    //   if (initialGate.messageObj.params[1].bids && initialGate.messageObj.params[1].bids.length != 0) {
    //     initialGate.bay = Number(initialGate.messageObj.params[1].bids[0][0]);
    //     initialGate.bayQuantity = Number(initialGate.messageObj.params[1].bids[0][1]);
    //     initialGate.bayTimestamp = new Date().getTime;
    //   }
    //   if (initialGate.messageObj.params[1].asks && initialGate.messageObj.params[1].asks.length != 0) {
    //     initialGate.sell = Number(initialGate.messageObj.params[1].asks[0][0]);
    //     initialGate.sellQuantity = Number(initialGate.messageObj.params[1].asks[0][1]);
    //     initialGate.sellTimestamp = new Date().getTime;
    //   }
    //   console.log('initialGate.bay:', initialGate.bay);//для отладки себе включить
    //   console.log('initialGate.sell:', initialGate.sell);//для отладки себе включить
    //   // Если массивы существуют, если они не пусты,
    //   if (initialGate.messageObj.params[1].asks && initialGate.messageObj.params[1].bids) {
    //     if (initialGate.messageObj.params[1].asks.length != 0 && initialGate.messageObj.params[1].bids.lengt != 0 &&
    //       initialGate.sell != undefined && initialGate.sell > 0 && initialGate.bay != undefined && initialGate.bay > 0) initialGate.globalFlag = true;
    //   }
    //   //  Если глобальный флаг Gate готов то инициализируем обычную работу программы
    //   if (initialGate.globalFlag) {
    //     // выбираем первые значения в стаканах на bay и sell и прибавляем комисиии
    //     initialGate.priceAndComissionsBay = initialGate.bay - initialGate.bay * initialGate.takerComissions;//  bay=bids это покупатели, клиенты продают самая выгодня цена для клиентов самая высокая, комиссию отнимаем
    //     console.log('initialGate.priceAndComissionsBay:', initialGate.priceAndComissionsBay);//для отладки себе включить

    //     initialGate.priceAndComissionsSell = initialGate.sell + initialGate.sell * initialGate.makerComissions; // sell=asks это продавцы, клиенты покупатели, самая выгодня цена для клиентов самая низкая, комиссию плюсуем
    //     console.log('initialGate.priceAndComissionsSell:', initialGate.priceAndComissionsSell);//для отладки себе включить


    //     console.log('initialBith.initialFetchURL=', initialBith.initialFetchURL);
    //     console.log('initialBith.initialWs=', initialBith.initialWs);

    //     // initialGate.messageEdit = {
    //     //   b: initialGate.messageObj.data.b,
    //     //   s: initialGate.messageObj.data.s,
    //     //   ver: initialGate.messageObj.data.ver,
    //     //   timestamp: initialGate.messageObj.timestamp
    //     // };
    //     if (initialBith.initialFetchURL && initialBith.initialWs) { // если готовы данные из bithumb
    //       console.log('priceAndComissionsBay For Gate:', initialBith.priceAndComissionsBay);
    //       console.log('priceAndComissionsSell For Gate:', initialBith.priceAndComissionsSell);

    //       const paramsGoTrade = {
    //         bayGate: initialGate.priceAndComissionsBay,
    //         bayBith: initialBith.priceAndComissionsBay,
    //         sellGate: initialGate.priceAndComissionsSell,
    //         sellBith: initialBith.priceAndComissionsSell,
    //         timeServer: new Date().getTime(),
    //         timeBith: initialBith.baySellTimestamp,
    //         timeGateSell: initialGate.sellTimestamp,
    //         timeGateBuy: initialGate.bayTimestamp,
    //         init: false,
    //       }

    //       // console.log('new Date().getTime():', new Date().getTime());

    //       // for (let i = 0; i < 100; i++) {
    //       //   goTrade(paramsGoTrade, writableFiles);
    //       // }
    //       goTrade(paramsGoTrade, writableFiles);
    //     };
    //     // let diffSellGate = initialBith.priceAndComissionsBay - initialGate.priceAndComissionsSell;
    //     // let diffBaylGate = initialGate.priceAndComissionsBay - initialBith.priceAndComissionsSell;

    //     // if (initialBith.initialFetchURL && initialBith.initialWs) { // если готовы данные из bithumb

    //     //   if (diffSellGate > 0) {
    //     //     console.log('Выгодно купить на Gate и продать на Bith = #1');
    //     //     const percentBonus = diffSellGate / initialGate.priceAndComissionsSell;
    //     //     console.log('percentBonus #1 =', percentBonus);
    //     //   }

    //     //   if (diffBaylGate > 0) {
    //     //     console.log('Выгодно продать на Gate и купить на Bith = #2');
    //     //     const percentBonus = diffBaylGate / initialBith.priceAndComissionsSell;
    //     //     console.log('percentBonus #2=', percentBonus);
    //     //   }
    //     //   console.log('diffSellGate=', diffSellGate);
    //     //   console.log('diffBaylGate=', diffBaylGate);
    //     // }

    //   }


    // }
  };

  ws.onclose = function () {
    initialGate.globalFlag = false;
    console.log('close');
  };

  ws.onerror = function (err) {
    initialGate.globalFlag = false;
    console.log('error', err);
  };
}

module.exports = { wsGetGate, initialGate }
