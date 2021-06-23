const moment = require('moment');
const WebSocket = require('ws');
const pako = require('pako');
const querystring = require('querystring');
const crypto = require('crypto');
const fs = require("fs");

const config = require('config');
const { goTrade } = require('../functions/functions');
// const WS_URL = 'wss://ws.gateio.ws/v3/';
// const WS_URL = 'wss://ws.gateio.io/v3/';

let initialGate = {
  globalFlag: false, // Глобальный ключ готовности программы для основного цикла работы
  takerComissions: 0.002,
  makerComissions: 0.002,
  priceAndComissionsBay: 1,
  priceAndComissionsSell: 1,
  priceBay: 1,
  priceSell: 1
};

const ws = new WebSocket(config.get("WS_URL_GATE"));

function getSign(str) {
  return crypto.createHmac('sha512', SECRET).update(str).digest().toString('base64');
}

const gateio = {
  gateGet: function (id, method, params) {
    const array = JSON.stringify({
      "id": id,
      "method": method,
      "params": params
    });
    ws.send(array);
  },
  gateRequest: function (id, method, params) {
    const nonce = Math.round(new Date().getTime());
    params = [KEY, getSign(nonce + ""), nonce];
    const array = JSON.stringify({
      "id": id,
      "method": method,
      "params": params
    });
    ws.send(array);
  },
}

let methods;


function wsGetGate(id, method, params, initialBith, writeableStream, counts) {


  ws.onopen = function () {
    console.log('open');
    methods = method;
    if (method == 'server.sign')
      gateio.gateRequest(id, method, params);
    else if (method == 'order.query' || method == 'order.subscribe' || method == 'order.update' ||
      method == 'order.unsubscribe' || method == 'balance.query' || method == 'balance.subscribe' ||
      method == 'balance.update' || method == 'balance.unsubscribe') {
      gateio.gateRequest(id, 'server.sign', []);
      methods = 'server.sign';
      setTimeout(() => {
        gateio.gateGet(id, method, params);
        methods = "";
      }, 1000)
    }
    else
      gateio.gateGet(id, method, params);
  };

  ws.onmessage = function (evt) {

    console.log('typeof evt.data:', typeof evt.data);
    let messageGateObj = JSON.parse(evt.data);
    if (messageGateObj.params) {
      //  Удаляем элемениты массивов где количество 0
      if (messageGateObj.params[1].asks) {
        //asks продавцы bids покупатели
        messageGateObj.params[1].asks = messageGateObj.params[1].asks.filter((number) => {
          return number[1] !== '0';
        });

        // messageGateObj.params[1].asks.forEach((element, i, arr) => {
        //   arr[i] = String(Number(element[0]) + Number(element[0]) * initialGate.takerComissions)

        // });
      };

      if (messageGateObj.params[1].bids) {
        messageGateObj.params[1].bids = messageGateObj.params[1].bids.filter((number) => {
          return number[1] !== '0';
        });
        // с учетом комиссий
        // messageGateObj.params[1].bids.forEach((element, i, arr) => arr[i] = String(Number(element[0]) + Number(element[0]) * initialGate.makerComissions));

      };
      // console.log('messageGateObj:', messageGateObj);
      console.log('messageGateObj.params[1]', messageGateObj.params[1]);
      if (messageGateObj.params[1].asks && messageGateObj.params[1].bids) initialGate.globalFlag = true;
      //  Если глобальный флаг Gate готов то инициализируем обыяную работу программы
      if (initialGate.globalFlag) {
        // выбираем первые значения в стаканах на bay и sell и прибавляем комисиии
        if (messageGateObj.params[1].bids) {
          initialGate.priceBay = Number(messageGateObj.params[1].bids[0][0]);
        }
        console.log('initialGate.priceBay:', initialGate.priceBay);//для отладки себе включить
        initialGate.priceAndComissionsBay = initialGate.priceBay - initialGate.priceBay * initialGate.takerComissions;//  bay=bids это покупатели, клиенты продают самая выгодня цена для клиентов самая высокая, комиссию отнимаем
        console.log('initialGate.priceAndComissionsBay:', initialGate.priceAndComissionsBay);//для отладки себе включить

        if (messageGateObj.params[1].asks) {
          initialGate.priceSell = Number(messageGateObj.params[1].asks[0][0]);
        }
        console.log('initialGate.priceSell:', initialGate.priceSell);//для отладки себе включить
        initialGate.priceAndComissionsSell = initialGate.priceSell + initialGate.priceSell * initialGate.makerComissions; // sell=asks это продавцы, клиенты покупатели, самая выгодня цена для клиентов самая низкая, комиссию плюсуем
        console.log('initialGate.priceAndComissionsSell:', initialGate.priceAndComissionsSell);//для отладки себе включить


        console.log('initialBith.initialFetchURL=', initialBith.initialFetchURL);
        console.log('initialBith.initialWs=', initialBith.initialWs);
        if (initialBith.initialFetchURL && initialBith.initialWs) { // если готовы данные из bithumb
          console.log('priceAndComissionsBay For Gate:', initialBith.priceAndComissionsBay);
          console.log('priceAndComissionsSell For Gate:', initialBith.priceAndComissionsSell);

          const paramsGoTrade = {
            bayGate: initialGate.priceAndComissionsBay,
            bayBith: initialBith.priceAndComissionsBay,
            sellGate: initialGate.priceAndComissionsSell,
            sellBith: initialBith.priceAndComissionsSell,
            timeServer: new Date().getTime(),
            timeBith: 0,
            init: true,

          }

          // console.log('new Date().getTime():', new Date().getTime());


          goTrade(paramsGoTrade, writeableStream, counts);
        };
        // let diffSellGate = initialBith.priceAndComissionsBay - initialGate.priceAndComissionsSell;
        // let diffBaylGate = initialGate.priceAndComissionsBay - initialBith.priceAndComissionsSell;

        // if (initialBith.initialFetchURL && initialBith.initialWs) { // если готовы данные из bithumb

        //   if (diffSellGate > 0) {
        //     console.log('Выгодно купить на Gate и продать на Bith = #1');
        //     const percentBonus = diffSellGate / initialGate.priceAndComissionsSell;
        //     console.log('percentBonus #1 =', percentBonus);
        //   }

        //   if (diffBaylGate > 0) {
        //     console.log('Выгодно продать на Gate и купить на Bith = #2');
        //     const percentBonus = diffBaylGate / initialBith.priceAndComissionsSell;
        //     console.log('percentBonus #2=', percentBonus);
        //   }
        //   console.log('diffSellGate=', diffSellGate);
        //   console.log('diffBaylGate=', diffBaylGate);
        // }

      }


    }
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
