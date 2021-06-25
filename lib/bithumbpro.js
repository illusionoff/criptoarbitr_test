const fetch = require('node-fetch');
const { goTrade } = require('../functions/functions');
const config = require('config');

const ReconnectingWebSocket = require('reconnecting-websocket');
const WS = require('ws');
// const WebSocket = require('ws');

let initialBith = {
  initialWs: false,
  initialFetchURL: false,
  messageObj: {},
  messageEdit: {},
  priceAndComissionsBay: 0,
  priceAndComissionsSell: 0,
  takerComissions: 0,
  makerComissions: 0,
  bay: undefined,
  sell: undefined,
  bayTimestamp: undefined,
  sellTimestamp: undefined,
  bayQuantity: undefined,
  sellQuantity: undefined,
}

const options = {
  WebSocket: WS, // custom WebSocket constructor
  connectionTimeout: 10000,
  maxRetries: 10,
};
const ws = new ReconnectingWebSocket(config.get('WS_URL_BITH'), [], options);
// const rws = new ReconnectingWebSocket(config.get('WS_URL_BITH'));



// const ws = new WebSocket(config.get('WS_URL_BITH'));

function wsStartBith(cmd, args, initialGate) {

  const array = JSON.stringify({
    "cmd": cmd,
    "args": [args]
  });

  ws.onopen = function () {
    console.log('open');
    ws.send(array);
  };

  // rws.addEventListener('open', () => {
  //   console.log('open rws');
  //   rws.send(array);
  // });

  // rws.addEventListener('error', (error) => {
  //   console.log('error rws');
  //   // console.log(error.target._ws._req);
  //   console.log(error);
  // });

  // // rws.error = function (err) {
  // //   console.log('error rws');
  // //   console.log(error);
  // // };

  // rws.addEventListener('close', () => {
  //   console.log('close rws');
  // });

  // rws.addEventListener('message', (message) => {
  //   console.log('open rws');
  //   initialBith.messageObj = JSON.parse(message.data); //utf8Data  с сервера это строка преобразуем в объект
  //   console.log('initialBith.messageObj:', initialBith.messageObj);
  //   if (initialBith.messageObj.code === "00007") {

  //     if (initialBith.messageObj.data.s === 'buy') {
  //       initialBith.bay = Number(initialBith.messageObj.data.p);
  //       initialBith.bayTimestamp = initialBith.messageObj.timestamp;
  //       initialBith.bayQuantity = Number(initialBith.messageObj.data.v);
  //       console.log('initialBith.messageObj.data.p', initialBith.messageObj.data.p);
  //       console.log('initialBith.bay', initialBith.bay);
  //       console.log('initialBith.bayTimestamp', initialBith.bayTimestamp);
  //       console.log('initialBith.bayQuantity', initialBith.bayQuantity);
  //       console.log('initialBith.makerComissions', initialBith.makerComissions);
  //       initialBith.priceAndComissionsBay = initialBith.bay - initialBith.bay * initialBith.makerComissions;
  //       console.log('initialBith.priceAndComissionsBay', initialBith.priceAndComissionsBay);
  //     }
  //   }
  // });


  ws.onmessage = function (message) {

    initialBith.messageObj = JSON.parse(message.data); //utf8Data  с сервера это строка преобразуем в объект
    console.log('initialBith.messageObj:', initialBith.messageObj);
    if (initialBith.messageObj.code === "00006") {
      // console.log('initialBith.messageObj.data.b:', initialBith.messageObj.data.b);
      // console.log('initialBith.messageObj.data.s:', initialBith.messageObj.data.s);

      // initialBith.messageObj.data.s.length = 10;
      // initialBith.messageObj.data.b.length = 10;

      // initialBith.arrBay = initialBith.messageObj.data.b;
      // initialBith.arrSell = initialBith.messageObj.data.s;

      // console.log('initialBith.arrBay:', initialBith.arrBay);
      // console.log('initialBith.arrSell:', initialBith.arrSell);

      // console.log('initialBith.messageObj.data.s:', initialBith.messageObj.data.s);
      // сортировка самый большой снизу
      //       var numbers = [4, 2, 5, 1, 3];
      // numbers.sort(function(a, b) {
      //   return a - b;
      // });
      // console.log(numbers); // [1, 2, 3, 4, 5]

      // // сортировка самый большой сверху
      //       var numbers = [4, 2, 5, 1, 3];
      //       numbers.sort(function (a, b) {
      //         return b - a;
      //       });
      //       console.log('numbers', numbers); // [1, 2, 3, 4, 5]
      //       // initialBith.arrBay = initialBith.messageObj.data.s
      // initialBith.messageObj.data.s

    }

    // console.log(counter + ':->' + Date.now() + ": Received: ");
    if (initialBith.messageObj.code === "00007") {
      console.log('initialBith.messageObj.code === 00007');
      // console.log('initialBith.messageObj.data.b:', initialBith.messageObj.data.b);//для отладки себе включить
      console.log('initialBith.messageObj.data.s:', initialBith.messageObj.data.s);//для отладки себе включить

      if (initialBith.messageObj.data.s === 'buy') {
        initialBith.bay = Number(initialBith.messageObj.data.p);
        initialBith.bayTimestamp = initialBith.messageObj.timestamp;
        initialBith.bayQuantity = Number(initialBith.messageObj.data.v);
        console.log('initialBith.messageObj.data.p', initialBith.messageObj.data.p);
        console.log('initialBith.bay', initialBith.bay);
        console.log('initialBith.bayTimestamp', initialBith.bayTimestamp);
        console.log('initialBith.bayQuantity', initialBith.bayQuantity);
        console.log('initialBith.makerComissions', initialBith.makerComissions);
        initialBith.priceAndComissionsBay = initialBith.bay - initialBith.bay * initialBith.makerComissions;
        console.log('initialBith.priceAndComissionsBay', initialBith.priceAndComissionsBay);
      }

      if (initialBith.messageObj.data.s === 'sell') {
        initialBith.sell = Number(initialBith.messageObj.data.p);
        initialBith.sellTimestamp = initialBith.messageObj.timestamp;
        initialBith.sellQuantity = Number(initialBith.messageObj.data.v);
        console.log('initialBith.messageObj.data.p', initialBith.messageObj.data.p);
        console.log('initialBith.sell', typeof initialBith.sell);
        console.log('initialBith.sellTimestamp', initialBith.sellTimestamp);
        console.log('initialBith.sellQuantity', initialBith.sellQuantity);
        console.log('initialBith.takerComissions', initialBith.takerComissions);
        console.log('initialBith.priceAndComissionsSell', initialBith.priceAndComissionsSell);
        initialBith.priceAndComissionsSell = initialBith.sell + initialBith.sell * initialBith.takerComissions;
        console.log('initialBith.priceAndComissionsSell', initialBith.priceAndComissionsSell);

      }

      if ((initialBith.bay != undefined) && (initialBith.sell != undefined) && (initialBith.bayQuantity != undefined) && (initialBith.sellQuantity != undefined) && (initialBith.bayTimestamp != undefined) && (initialBith.sellTimestamp != undefined)) {
        initialBith.initialWs = true;
      }
      console.log('initialBith.initialWs', initialBith.initialWs);
      // console.log('initialBith.messageObj.data.b.length:', initialBith.messageObj.data.b.length);//для отладки себе включить
      // console.log('initialBith.messageObj.data.s.length:', initialBith.messageObj.data.s.length);//для отладки себе включить

      // // сранение массива  числе с числом
      //       function compareArr(arr, number) {
      //         const even = (element) => {
      //           // console.log('testNumber=', testNumber);
      //           return element > testNumber;
      //         }
      //         return array.some(even)
      //       }
      //       console.log('compareArr(array,testNumber)=', compareArr(array, testNumber));



      // expected output: true
      // array.forEach(function (item, i, arr) {
      //   console.log('testNumber=', testNumber);
      //   if (item > testNumber) {
      //     console.log('item > testNumber');
      //   } else {
      //     console.log('item < testNumber');
      //   }
      // });
      // let arr = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

      // let number = 4;
      // //  сортировка по убыванию
      // // if (number > arr[9]) {
      // //   arr[9] = number;
      // //   arr.sort(function (a, b) {
      // //     return b - a;
      // //   });
      // //  сортировка по возрастанию
      // if (number > arr[9]) {
      //   arr[9] = number;
      //   arr.sort(function (a, b) {
      //     return a - b;
      //   });
      // }
      // console.log('arr=', arr);


      // console.log('initialBith.arrBay1', initialBith.arrBay);
      // if (initialBith.messageObj.data.b.length === 1) {
      //   if (initialBith.messageObj.data.b[0][1] != '0.000000') {
      //     const number = initialBith.messageObj.data.b[0];
      //     const arr = initialBith.arrBay;
      //     if (initialBith.messageObj.data.b[0] > initialBith.arrBay[9]) {

      //       console.log('YES Сработала вставка в массив bay! ')
      //       initialBith.arrBay[9] = initialBith.messageObj.data.b[0];

      //       // временный массив
      //       const virtualArr = initialBith.arrBay.map((element) => { return element[0] })
      //       console.log('virtualArr=', virtualArr);
      //       //  сортировка по убыванию
      //       if (number > arr[9]) {
      //         arr[9] = number;
      //         arr.sort(function (a, b) {
      //           return b - a;
      //         });
      //       }
      //       console.log(' initialBith.messageObj.data.b[0]', initialBith.messageObj.data.b[0]);
      //       console.log('initialBith.arrBay2', initialBith.arrBay);
      //       process.exit();
      //     } else {
      //       console.log('NOT! ')
      //     }
      //   }
      // }



      //  изменяем цену с учетом комиссий
      // initialBith.messageObj.data.s.forEach((element, i, arr) => arr[i] = String(Number(element[0]) + Number(element[0]) * initialBith.takerComissions));
      // initialBith.messageObj.data.b.forEach((element, i, arr) => arr[i] = String(Number(element[0]) - Number(element[0]) * initialBith.makerComissions));
      // initialBith.priceAndComissionsBay = initialBith.Bay - initialBith.Bay * initialBith.makerComissions;
      // initialBith.priceAndComissionsSell = initialBith.Sell + initialBith.Sell * initialBith.takerComissions;

      // console.log('initialBith.priceAndComissionsBay test= ', initialBith.priceAndComissionsBay);
      // console.log('initialBith.priceAndComissionsSell test= ', initialBith.priceAndComissionsSell);

      // console.log('initialBith.Bay= ', initialBith.Bay);
      // console.log('initialBith.makerComissions= ', initialBith.makerComissions);
      // console.log('initialBith.Sell= ', initialBith.Sell);
      // console.log('initialBith.takerComissions= ', initialBith.takerComissions);


      // initialBith.messageEdit = {
      //   b: initialBith.messageObj.data.b,
      //   s: initialBith.messageObj.data.s,
      //   ver: initialBith.messageObj.data.ver,
      //   timestamp: initialBith.messageObj.timestamp
      // };

      // // console.log('initialBith.messageEdit.b:', initialBith.messageEdit.b);//для отладки себе включить
      // // console.log('initialBith.messageEdit.s:', initialBith.messageEdit.s);//для отладки себе включить
      // // console.log('initialBith.messageEdit.s.length:', initialBith.messageEdit.s.length);//для отладки себе включить

      // // выбираем первые значения в стаканах на bay и sell и прибавляем комисиии
      // // console.log('Number(initialBith.messageEdit.b[0][0])=', initialBith.messageEdit.b[0]);

      // // if (!initialBith.messageEdit.b[0][0]) {

      // // }
      // initialBith.priceAndComissionsBay = Number(initialBith.messageEdit.b[0][0]) - Number(initialBith.messageEdit.b[0][0]) * initialBith.takerComissions;
      // initialBith.priceAndComissionsSell = Number(initialBith.messageEdit.s[0][0]) + Number(initialBith.messageEdit.s[0][0]) * initialBith.makerComissions;
      // console.log('initialBith.priceAndComissionsBay:', initialBith.priceAndComissionsBay);//для отладки себе включить
      // console.log('initialBith.priceAndComissionsSell:', initialBith.priceAndComissionsSell);//для отладки себе включить


      // if (initialGate.globalFlag) {
      //   const paramsGoTrade = {
      //     bayGate: initialGate.priceAndComissionsBay,
      //     bayBith: initialBith.priceAndComissionsBay,
      //     sellGate: initialGate.priceAndComissionsSell,
      //     sellBith: initialBith.priceAndComissionsSell,
      //     timeServer: new Date(),
      //     timeBith: 0,
      //     init: true
      //   }
      //   // goTrade(paramsGoTrade);
      // };
    }


  };

  ws.onclose = function () {
    initialBith.initialWs = false;
    console.log('close');
    ws.onopen();
    console.log('open new connection');
  };

  ws.onerror = function (err) {
    initialBith.initialWs = false;
    console.log('error', err);
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


// client.on('connectFailed', function (error) {
//   console.log('Connect Error: ' + error.toString());
// });

// let counter = 0;
//       // let arrayCurrentBithumb = {};
// let initialBith.messageObj = {};
// let initialBith.messageEdit = {};
// client.on('connect', function (connection) {
//   console.log('WebSocket Client Connected');
//   connection.on('error', function (error) {
//     console.log("Connection Error: " + error.toString());
//   });
//   connection.on('close', function () {
//     console.log('echo-protocol Connection Closed');
//   });


//   connection.on('message', function (message) {
//     counter++;
//       // console.log(counter + ':->' + Date.now() + ": Received: '" + message.utf8Data);
//       // console.log(counter + ':->' + Date.now() + ": Received: ");

//     initialBith.messageObj = JSON.parse(message.utf8Data); //utf8Data  с сервера это строка преобразуем в объект

//     if (initialBith.messageObj.code === "00007") {
//       console.log('initialBith.messageObj.code === 00007');
//           // console.dir('JSON.stringify(messageObj):', JSON.stringify(messageObj));
//           // console.log('initialBith.messageObj:', initialBith.messageObj);
//           // console.log('initialBith.messageEdit:', initialBith.messageEdit);

//       console.log('initialBith.messageObj.data.b:', initialBith.messageObj.data.b);//для отладки себе включить
//       console.log('initialBith.messageObj.data.s:', initialBith.messageObj.data.s);//для отладки себе включить
//       //  изменяем цену с учетом комиссий
//       initialBith.messageObj.data.s.forEach((element, i, arr) => arr[i] = String(Number(element[0]) + Number(element[0]) * initialBith.takerComissions));
//       initialBith.messageObj.data.b.forEach((element, i, arr) => arr[i] = String(Number(element[0]) + Number(element[0]) * initialBith.makerComissions));

//       initialBith.messageEdit = {
//         b: initialBith.messageObj.data.b,
//         s: initialBith.messageObj.data.s,
//         ver: initialBith.messageObj.data.ver,
//         timestamp: initialBith.messageObj.timestamp
//       };

//       console.log('initialBith.messageEdit.b:', initialBith.messageEdit.b);//для отладки себе включить
//       console.log('initialBith.messageEdit.s:', initialBith.messageEdit.s);//для отладки себе включить

//       // // console.log('initialBith.messageEdit:', initialBith.messageEdit);//для отладки себе включить
//       // initialBith.messageEdit.b.forEach(element => console.log(Number(element[0]) + Number(element[0]) * initialBith.takerComissions));

//       // console.log('initialBith.messageEdit.b:', initialBith.messageEdit.b);//для отладки себе включить

//       // console.log('initialBith.messageObj.data.b:', initialBith.messageObj.data.b);
//       // console.dir('JSON.stringify(message.utf8Data):', message.utf8Data), null, 4);
//       // console.dir('JSON.stringify(message.utf8Data, null, 4):', JSON.stringify(message.utf8Data, null, 4));
//       // console.log('JSON.stringify(message, null, 4):', JSON.stringify(message, null, 4));
//       // arrayCurrentBithumb = messageObj;
//       // console.log('arrayCurrentBithumb:', arrayCurrentBithumb);
//       // console.log('messageObj.code:', messageObj.code);
//     }
//   });

//   // function sendNumber() {
//   //   if (connection.connected) {
//   //     var number = Math.round(Math.random() * 0xFFFFFF);
//   //     connection.sendUTF(number.toString());
//   //     setTimeout(sendNumber, 1000);
//   //   }
//   // }
//   // sendNumber();
//   function ping() {
//     connection.send(JSON.stringify({ "cmd": "ping" }));
//     setTimeout(ping, 10000);
//   }
//   ping();

//   function subscribe() {
//     // connection.send(JSON.stringify({ "cmd": "subscribe", "args": ["ORDERBOOK:BTC-USDT"] }));
//     // ping();
//     // connection.send(JSON.stringify({ "cmd": "subscribe", "args": ["TICKER:XRP-USDT"] }));
//     // connection.send(JSON.stringify({ "cmd": "subscribe", "args": ["TRADE:XRP-USDT", "TICKER:XRP-USDT"] }));
//     connection.send(JSON.stringify({ "cmd": "subscribe", "args": ["ORDERBOOK10:XRP-USDT"] }));
//     // connection.send(JSON.stringify({ "cmd": "subscribe", "args": ["TRADE:XRP-USDT"] }));
//     // connection.send(JSON.stringify({ "cmd": "subscribe", "args": ["CONTRACT_TICKER:BTC-USDT"] }));// НЕ работают все с CONTRACT_ , в документации ошибка-Ю ответ в вопросах на Git

//   }
//   subscribe();


//   function countOneMin() {
//     console.log('countOneMin:', counter);
//     setTimeout(countOneMin, 60000);
//   }

//   countOneMin();
// });


// // client.connect('ws://localhost:8080/', 'echo-protocol');
// client.connect('wss://global-api.bithumb.pro/message/realtime');
