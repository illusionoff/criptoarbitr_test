const WebSocket = require('ws');
const ReconnectingWebSocket = require('reconnecting-websocket');
const WS = require('ws');
const { goTrade, changeTradeArr, reconnectTimeMessageClosure, closureTimeStopTest, consoleLogGroup } = require('../functions/functions');
const config = require('config');

const TRACK_ELEMENT_ORDERBOOK = config.get('TRACK_ELEMENT_ORDERBOOK');
// для тестов
let countErrors = 0;
let countReconnect = -1;
let initialGate = {
  name: 'gate',
  globalFlag: false, // Глобальный ключ готовности программы для основного цикла работы
  messageObj: {},
  messageEdit: {},
  messageRefresh: {},
  allOrderbookBay: [],
  allOrderbookSell: [],
  takerComissions: 0.002,
  makerComissions: 0.002,
  speedComissions: 0.002,
  priceAndComissionsBay: 0,
  priceAndComissionsSell: 0,
  bay: 0,
  sell: 0,
  ver: 0,
  orderbookFirstPreviousBay: undefined,
  orderbookFirstPreviousSell: undefined,
  bayOrSell: -1,
  // bayTimestamp: undefined,
  // sellTimestamp: undefined,
  timeServer: undefined,
  timeFileServerCorrect: undefined,
  bayQuantity: undefined,
  sellQuantity: undefined,
  timeBay: undefined,
  timeSell: undefined,
  time: undefined,
};

const options = {
  WebSocket: WS, // custom WebSocket constructor
  connectionTimeout: 5000,
  // perMessageDeflate: false// непонятно работает ли
  // maxRetries: 10,// default infinity
};
const ws = new ReconnectingWebSocket(config.get('WS_URL_GATE_v4'), [], options);
// function getSign(str) {
//   return crypto.createHmac('sha512', SECRET).update(str).digest().toString('base64');
// }

const gateio = {
  // gateGet: function (id, method, params) {
  gateGet: function (time, channel, event, payload) {
    // const array = JSON.stringify({
    //   "id": id,
    //   "method": method,
    //   "params": params
    // });
    const array = JSON.stringify({
      "time": time,// "time": Number(new Date().getTime()),
      "channel": channel, //book_ticker order_book_update
      "event": event, //"event": "subscribe",
      "payload": payload//["XRP_USDT", "100ms"]
    });
    ws.send(array);
  },
}

let ping;
function startPing(time) {
  clearInterval(ping);
  ping = setInterval(function () {
    console.log('ping==========================================================================');
    let time = new Date().getTime();
    console.log('time ping', time);
    ws.send(JSON.stringify({ "time": time, "channel": "spot.ping" }));
  }, time);
}

function stopPing() {
  clearInterval(ping);
  console.log('stopPing');
}

// function wsGetGate(id, method, params, initialBith, writableFiles) {
function wsGetGate(time, channel, event, payload, initialBith, writableFiles) {
  reinit(initialGate); // обнуление объекта инициализации
  let maxPercent = 0;
  function reinit(initialGate) {
    initialGate = {
      name: 'gate',
      globalFlag: false, // Глобальный ключ готовности программы для основного цикла работы
      messageObj: {},
      messageEdit: {},
      messageRefresh: {},
      allOrderbookBay: [],
      allOrderbookSell: [],
      takerComissions: 0.002,
      makerComissions: 0.002,
      speedComissions: 0.002,
      priceAndComissionsBay: 0,
      priceAndComissionsSell: 0,
      bay: 0,
      sell: 0,
      ver: 0,
      orderbookFirstPreviousBay: undefined,
      orderbookFirstPreviousSell: undefined,
      bayOrSell: -1,
      // bayTimestamp: undefined,
      // sellTimestamp: undefined,
      timeServer: undefined,
      timeFileServerCorrect: undefined,
      bayQuantity: undefined,
      sellQuantity: undefined,
      timeBay: undefined,
      timeSell: undefined,
      time: undefined,
    };

  }

  let timeStopTest = closureTimeStopTest();
  let reconnectTimeMessage = reconnectTimeMessageClosure(ws);

  ws.onopen = function () {
    startPing(10000);
    countReconnect++;
    gateio.gateGet(time, channel, event, payload);
  };

  ws.onmessage = function (evt) {
    console.log('onmessage Gate');
    initialGate.messageObj = JSON.parse(evt.data);
    console.log('onmessage Gate initialGate.messageObj.time=', initialGate.messageObj.time);
    console.log('onmessage Gate initialGate.messageObj=', initialGate.messageObj);

    const strMessageGate = `onmessage Gate
    initialGate.messageObj.time = ${initialGate.messageObj.time}
    initialGate.messageObj = ${initialGate.messageObj}`
    consoleLogGroup(strMessageGate);
    if (initialGate.messageObj.error) {
      console.log('Reconnect error', initialGate.messageObj.error);
      return ws.reconnect(1006, 'Reconnect error');
    }

    if (initialGate.messageObj.channel === 'spot.pong' && initialGate.messageObj.result === null) {
      console.log('!Pong Gate');
      // process.exit();
    } else {
      // Не учитываем сообщения Pong
      timeStopTest(countReconnect, countErrors);
      reconnectTimeMessage(); // если превышено время между сообщениями
    }

    // основное message обновления ORDERBOOK
    if (initialGate.messageObj.event == "update" && initialGate.messageObj.result.bids) {
      initialGate.time = initialGate.messageObj.result.t;
      initialGate.timeServer = new Date().getTime();

      const length = initialGate.messageObj.result.bids.length - 1;
      const bids0 = initialGate.messageObj.result.bids[0][0];
      const bidsMaxLength = initialGate.messageObj.result.bids[length][0];
      const percent = ((bids0 - bidsMaxLength) / bids0) * 100;
      if (percent > maxPercent) maxPercent = percent;
      const strLength = `initialGate.messageObj.result.bids.length = ${initialGate.messageObj.result.bids.length}
      initialGate.messageObj.result.bids[0][0] = ${initialGate.messageObj.result.bids[0][0]}
      initialGate.messageObj.result.bids[length][0]) = ${initialGate.messageObj.result.bids[length][0]}
      percent bids[0][0]-bids[length][0] = ${percent}
      maxPercent= ${maxPercent}`; //  за 5 минут получил 0.109 % maxPercent. За 8 дней 2.41%
      consoleLogGroup(strLength);
      // берем самый худший результат т.е  последний элемент массива
      initialGate.bay = Number(initialGate.messageObj.result.bids[TRACK_ELEMENT_ORDERBOOK][0]);
      initialGate.sell = Number(initialGate.messageObj.result.asks[TRACK_ELEMENT_ORDERBOOK][0]);
      if (!Boolean(initialGate.orderbookFirstPreviousBay)) initialGate.orderbookFirstPreviousBay = initialGate.bay;
      if (!Boolean(initialGate.orderbookFirstPreviousSell)) initialGate.orderbookFirstPreviousSell = initialGate.sell;
      if (initialGate.orderbookFirstPreviousBay && initialGate.orderbookFirstPreviousSell) {
        initialGate.globalFlag = true;
        console.log('initialGate.globalFlag = true');
      }
      const strPrevious = `It'sGate
      initialGate.orderbookFirstPreviousBay = ${initialGate.orderbookFirstPreviousBay}
      initialGate.bay = ${initialGate.bay}`;
      consoleLogGroup(strPrevious);
      process.exit();
      if (initialGate.globalFlag && initialBith.globalFlag) { // если готовы данные из bithumb
        if (changeTradeArr(initialGate)) {
          const paramsGoTrade = {
            bayGate: initialGate.priceAndComissionsBay,
            bayBith: initialBith.priceAndComissionsBay,
            sellGate: initialGate.priceAndComissionsSell,
            sellBith: initialBith.priceAndComissionsSell,
            timeServer: initialGate.timeServer,
            timeBith: initialBith.time,
            timeGate: initialGate.time,
            timeGateSell: initialGate.timeSell,
            timeGateBay: initialGate.timeBay,
            timeBithSell: initialBith.timeSell,
            timeBithBay: initialBith.timeBay,
            bayOrSellGate: initialGate.bayOrSell,
            bayOrSellBith: initialBith.bayOrSell,
            init: 1,
          }
          goTrade(paramsGoTrade, writableFiles);
        }
      }

    }


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
    initialGate.sell = 0;
    initialGate.bay = 0;
    initialGate.flagStartPrevious = false;
    console.log('close');
    stopPing();
  };

  ws.onerror = function (err) {
    initialGate.globalFlag = false;
    initialGate.sell = 0;
    initialGate.bay = 0;
    initialGate.flagStartPrevious = false;
    console.log('error', err);
    countErrors++;
    stopPing();
  };
}

module.exports = { wsGetGate, initialGate }