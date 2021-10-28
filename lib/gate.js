const ReconnectingWebSocket = require('reconnecting-websocket');
const WS = require('ws');
const { goTrade, changeTradeArr, timeStopTestClosure, consoleLogGroup, reinitGate, maxPercentCupClosure, timerClosure, funStartPingGate, funEndPing, funStartReconnect } = require('../functions/functions');
const config = require('config');

const TRACK_ELEMENT_ORDERBOOK = config.get('TRACK_ELEMENT_ORDERBOOK');
const VERSION = config.get('VERSION');
const TIMER_PING = config.get('TIMER_PING');
const TIMER_RECONNECT_MESSAGE = config.get('TIMER_RECONNECT_MESSAGE');

// для тестов
let countErrors = 0;
let countReconnect = -1;
let initialGate = {
  name: 'gate',
  globalFlag: false, // Глобальный ключ готовности программы для основного цикла работы
  messageObj: {},
  takerComissions: 0.002,
  makerComissions: 0.002,
  speedComissions: 0.002,
  priceAndComissionsBay: 0,
  priceAndComissionsSell: 0,
  buy: 0,
  sell: 0,
  ver: 0,
  orderbookFirstPreviousBay: undefined,
  orderbookFirstPreviousSell: undefined,
  buyOrSell: -1,
  timeServer: undefined,
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

function wsGetGate(time, channel, event, payload, initialBith, writableFiles) {
  reinitGate(initialGate); // обнуление объекта инициализации для перезапуска функции
  let timeStopTest = timeStopTestClosure();
  // let reconnectTimeMessage = reconnectTimeMessageClosure(ws);
  let timerConfigPing = {
    period: TIMER_PING, funStart: funStartPingGate, funEnd: funEndPing,
    funStartArguments: [ws, initialGate.name], funEndArguments: []
  };
  let timerConfigReconnect = {
    period: TIMER_RECONNECT_MESSAGE, funStart: funStartReconnect,
    funStartArguments: [ws], warming: 1
  };
  //если превышено время между сообщениями то реконнект
  let timerReconnectMessages = timerClosure(timerConfigReconnect);
  // периодическая отправка ping
  let timerPing = timerClosure(timerConfigPing);
  let maxPercentCup = maxPercentCupClosure();
  ws.onopen = function () {
    countReconnect++;
    gateio.gateGet(time, channel, event, payload);
    timerPing.start();
  };

  ws.onmessage = function (evt) {
    initialGate.messageObj = JSON.parse(evt.data);
    consoleLogGroup`onmessage Gate
    initialGate.messageObj.time = ${initialGate.messageObj.time}
    initialGate.messageObj = ${initialGate.messageObj}`;
    if (initialGate.messageObj.error) {
      console.log('Reconnect error', initialGate.messageObj.error);
      return ws.reconnect(1006, 'Reconnect error');
    }

    if (initialGate.messageObj.channel === 'spot.pong' && initialGate.messageObj.result === null) {
      console.log('!Pong Gate');
    } else {
      // Не учитываем сообщения Pong
      timeStopTest({ countReconnect, countErrors, name: initialGate.name });
      timerReconnectMessages.start();// если превышено время между сообщениями
    }
    // основное message обновления ORDERBOOK
    if (initialGate.messageObj.event == "update" && initialGate.messageObj.result.bids) {
      // разница между нулевым элементом в ORDERBOOK и последним (9-тый индекс)
      maxPercentCup(initialGate.messageObj);
      // берем самый худший результат т.е  последний элемент массива
      initialGate.buy = Number(initialGate.messageObj.result.bids[TRACK_ELEMENT_ORDERBOOK][0]);
      initialGate.sell = Number(initialGate.messageObj.result.asks[TRACK_ELEMENT_ORDERBOOK][0]);
      if (!Boolean(initialGate.orderbookFirstPreviousBay)) initialGate.orderbookFirstPreviousBay = initialGate.buy;
      if (!Boolean(initialGate.orderbookFirstPreviousSell)) initialGate.orderbookFirstPreviousSell = initialGate.sell;
      if (initialGate.orderbookFirstPreviousBay && initialGate.orderbookFirstPreviousSell) {
        initialGate.globalFlag = true;
        console.log('initialGate.globalFlag = true');
      }
      consoleLogGroup`It'sGate
      initialGate.orderbookFirstPreviousBay = ${initialGate.orderbookFirstPreviousBay}
      initialGate.buy = ${initialGate.buy}
      Ver: ${VERSION}`;
      if (initialGate.globalFlag && initialBith.globalFlag) { // если готовы данные из bithumb
        if (changeTradeArr(initialGate)) {
          initialGate.time = initialGate.messageObj.result.t;
          initialGate.timeServer = new Date().getTime();
          const paramsGoTrade = {
            buyGate: initialGate.priceAndComissionsBay,
            buyBith: initialBith.priceAndComissionsBay,
            sellGate: initialGate.priceAndComissionsSell,
            sellBith: initialBith.priceAndComissionsSell,
            timeServer: initialGate.timeServer,
            timeBith: initialBith.time,
            timeGate: initialGate.time,
            timeGateSell: initialGate.timeSell,
            timeGateBay: initialGate.timeBay,
            timeBithSell: initialBith.timeSell,
            timeBithBay: initialBith.timeBay,
            buyOrSellGate: initialGate.buyOrSell,
            buyOrSellBith: initialBith.buyOrSell,
            init: 1,
          }
          goTrade(paramsGoTrade, writableFiles);
        }
      }
    }
  };

  ws.onclose = function () {
    initialGate.globalFlag = false;
    initialGate.sell = 0;
    initialGate.buy = 0;
    initialGate.flagStartPrevious = false;
    console.log('close');
    timerPing.stop();
  };

  ws.onerror = function (err) {
    initialGate.globalFlag = false;
    initialGate.sell = 0;
    initialGate.buy = 0;
    initialGate.flagStartPrevious = false;
    console.log('error', err);
    countErrors++;
    timerPing.stop();
  };
}

module.exports = { wsGetGate, initialGate }
