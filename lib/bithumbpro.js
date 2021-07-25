const fetch = require('node-fetch');
const fs = require("fs");
const { goTrade } = require('../functions/functions');
const config = require('config');

const ReconnectingWebSocket = require('reconnecting-websocket');
const WS = require('ws');
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


// запись статистики
setInterval(() => {
  let sumBay = initialBith.indexLeveragesOrderbookBay.reduce((sum, current) => sum + current, 0);
  let sumSell = initialBith.indexLeveragesOrderbookSell.reduce((sum, current) => sum + current, 0);
  // let sumsell = initialBith.indexLeveragesOrderbookSell.reduce((sum, current) => sum + current, 0);
  let fileBay = fs.createWriteStream('indexLeveragesOrderbookBay.txt');
  fileBay.on('error', function (err) { Console.log(err) });
  initialBith.indexLeveragesOrderbookBay.forEach((value, index) => {
    if (sumBay === 0) sumBay = 1;
    let percent = (value / sumBay) * 100;
    fileBay.write(`${index}:${value}:=${percent.round(comma)}\r\n`);
  });
  fileBay.end();
  let fileSell = fs.createWriteStream('indexLeveragesOrderbookSell.txt');
  fileSell.on('error', function (err) { Console.log(err) });
  initialBith.indexLeveragesOrderbookSell.forEach((value, index) => {
    if (sumSell === 0) sumSell = 1;
    let percent = (value / sumSell) * 100;
    fileSell.write(`${index}:${value}:=${percent.round(comma)}\r\n`);
  });
  fileSell.end();
  // fs.writeFile("indexLeveragesOrderbookBay.txt", initialBith.indexLeveragesOrderbookBay);
  // fs.writeFile("indexLeveragesOrderbookSell.txt", initialBith.indexLeveragesOrderbookSell);
}, 60000)


// const ws = new WebSocket(config.get('WS_URL_BITH'));

// {encoding: 'utf8', highWaterMark: 332 * 1024});// задать значение буфера


function indexOfTwoDimens(arr, value) {
  for (let i = 0; i < arr.length; i++) {
    // console.log(arr[i][0]);
    if (arr[i][0] === value) return i
  }
  return -1
}

function orderbookChange(allOrderbook, newMessage, BayOrSell) {
  const index = indexOfTwoDimens(allOrderbook, newMessage[0][0]);
  console.log('index=', index);
  if (index >= 0) {
    // Тест сбор статистики частоты использоваания индексов  сделок в Orderbook
    if (index < 20) {
      if (BayOrSell) {
        let nawQuantity = initialBith.indexLeveragesOrderbookBay[index] + 1;
        initialBith.indexLeveragesOrderbookBay[index] = nawQuantity;
      } else {
        let nawQuantity = initialBith.indexLeveragesOrderbookSell[index] + 1;
        initialBith.indexLeveragesOrderbookSell[index] = nawQuantity;

      }
    }
    console.log('indexLeveragesOrderbookBay====================', initialBith.indexLeveragesOrderbookBay);
    console.log('indexLeveragesOrderbookSell===================', initialBith.indexLeveragesOrderbookSell);
    //  удалить из массива этот элемент
    if (newMessage[0][1] === '0.000000') return allOrderbook.splice(index, 1)
    // заменить новым значением
    return allOrderbook[index][1] = newMessage[0][1];
  }
  // // Если элемент не найден, то добавить в массив и упорядочить по убыванию
  allOrderbook.push(newMessage[0]);
  if (BayOrSell) return allOrderbook.sort((a, b) => { return Number(b[0]) - Number(a[0]) })
  allOrderbook.sort((a, b) => { return Number(a[0]) - Number(b[0]) });

  // const index = indexOfTwoDimens(allOrderbook, newMessage[0][0]);
  // console.log('index=', index);
  // if (index >= 0) {
  //   //  удалить из массива этот элемент
  //   if (newMessage[0][1] === '0.000000') return allOrderbook.splice(index, 1);
  //   // заменить новым значением
  //   return allOrderbook[index][1] = newMessage[0][1];
  // }
  // // // Если элемент не найден, то добавить в массив и упорядочить по убыванию
  // allOrderbook.push(newMessage[0]);
  // if (BayOrSell) return allOrderbook.sort((a, b) => { return Number(b[0]) - Number(a[0]) })
  // allOrderbook.sort((a, b) => { return Number(a[0]) - Number(b[0]) });
}

function changeFirstOrderbook(Orderbook, OrderbookNow) {

  console.log('Orderbook=', Orderbook);
  console.log('OrderbookNow[0]=', OrderbookNow[0]);
  if (Orderbook[0] == OrderbookNow[0][0] && Orderbook[1] == OrderbookNow[0][1]) return false
  // Orderbook[0] = OrderbookNow[0];

  Orderbook[0] = OrderbookNow[0][0];
  Orderbook[1] = OrderbookNow[0][1];
  console.log('Orderbook 2=', Orderbook);
  return true
}

function TestWritable2() {
  let testWriteableStream_1 = fs.createWriteStream("logs/test_profit_1.csv", { flags: 'a' })
  let testWriteableStream_2 = fs.createWriteStream("logs/test_profit_2.csv", { flags: 'a' })
  let testFlag = 1;
  let testCount = 0;
  let testCountAll = 0;
  function testIf() {
    let time = new Date().getTime();
    console.log('time:', time);
    if (testCount === 2) {
      // testWriteableStream_2.write_2 = fs.createWriteStream(`logs/test2_profit${time}.csv`, { flags: 'a' });
      console.log('testWriteableStream_2._writableState 5:----------------------------------------------', testWriteableStream_2._writableState);
      testWriteableStream_2.write(`writeableStream_${testCount}\r\n`);
    }

    if (testCount === 5) {
      console.log('testWriteableStream_2._writableState 10:----------------------------------------------', testWriteableStream_2._writableState);
      testWriteableStream_2.write(`writeableStream_${testCount}\r\n`);
    }

    if (testCount === 10) {
      console.log('testWriteableStream_2._writableState 10:----------------------------------------------', testWriteableStream_2._writableState);
      testWriteableStream_2.write(`writeableStream_${testCount}\r\n`);
    }
    testCount++;
  }

  return function () {
    // return testCount++, testWriteableStream_2.write_2.write(`writeableStream_${testCount}\r\n`); // есть доступ к внешней переменной "count"
    return testIf(); // есть доступ к внешней переменной "count"
  };
}

// let variableTestWritable2 = TestWritable2();
// setInterval(variableTestWritable2, 1000);

// function TestWritable() {
//   let testFlag = 1;
//   let testCount = 0;
//   let testCountAll = 0;
//   let testWriteableStream = {
//     write_1: fs.createWriteStream("logs/test_profit_1.csv", { flags: 'a' }),
//     write_2: fs.createWriteStream("logs/test_profit_2.csv", { flags: 'a' })
//   }
//   // let testWriteableStream = {
//   //   write_2: fs.createWriteStream("logs/test_profit_2.csv", { flags: 'a' })
//   // }

//   // console.log('testCountAll=', testCountAll);
//   // console.log('function TestWritable----------------------------------------------------------------------------------------------------');
//   // console.log(`testCount=${testCount}----------------------------------------------------------------------------------------------------`);
//   // console.log('testWriteableStream_1.writableLength', testWriteableStream_1.write_1.writableLength);
//   // console.log('testWriteableStream_1:', testWriteableStream_1.write_1);

//   // if (testFlag === 2) {
//   //   if (!testWriteableStream_1._writableState.finished) {
//   //     if (testWriteableStream_1._writableState.length === 0) {
//   //       console.log(`Stream_1 Buffer=0 ----------------------------------------------------------------------------------------------------`);
//   //       testWriteableStream_1.end();
//   //       testWriteableStream_1.close();
//   //       // testWriteableStream_1.destroy();
//   //     }
//   //   }
//   // }
//   // if ((testFlag === 1) && (testWriteableStream_2)) {
//   //   if (!testWriteableStream_2._writableState.finished) {
//   //     if (testWriteableStream_2._writableState.length === 0) {
//   //       // process.exit();
//   //       console.log(`Stream_1 Buffer=0 ----------------------------------------------------------------------------------------------------`);
//   //       testWriteableStream_2.end();
//   //       testWriteableStream_2.close();
//   //       // testWriteableStream_2.destroy(console.log(`testWriteableStream_2.destroy()`));
//   //       console.log(`testWriteableStream_2.close() ----------------------------------------------------------------------------------------------------`);
//   //     }
//   //   }
//   // }
//   function main() {
//     if (testCount > 20) {
//       testCount = 0;
//       if (testFlag === 1) {
//         testFlag = 2;
//         console.log('testFlag=2----------------------------------------------------------------------------------------------------');
//         // testWriteableStream_1.end();
//         // testWriteableStream_1.close();

//         // if (writeableStream._writableState.closed) {
//         let time = new Date().getTime();
//         console.log('time:', time);
//         testWriteableStream.write_2 = fs.createWriteStream(`logs/test2_profit${time}.csv`, { flags: 'a' });
//         testWriteableStream.write_1.end();

//         console.log('testWriteableStream._writableState:', testWriteableStream.write_2._writableState);
//         testWriteableStream.write_1.on('drain', () => {
//           console.log('estWriteableStream_1 drain buffer = 0-------------------------------------------------------------------------------');
//           testWriteableStream.write_1.end();
//         })
//         testWriteableStream.write_1.on('finish', () => {
//           console.log('estWriteableStream_1 The end-------------------------------------------------------------------------------');
//           testWriteableStream.write_1.close();
//           // testWriteableStream.destroy();
//           // process.exit();
//         })
//         return
//       }
//       testFlag = 1;
//       console.log('testFlag=1----------------------------------------------------------------------------------------------------');
//       // testWriteableStream.end();
//       // testWriteableStream.close();

//       // if (writeableStream._writableState.closed) {
//       let time = new Date().getTime();
//       console.log('time:', time);
//       testWriteableStream.write_1 = fs.createWriteStream(`logs/test1_profit${time}.csv`, { flags: 'a' });
//       testWriteableStream.write_2.end();

//       console.log('testWriteableStream._writableState:', testWriteableStream.write_1._writableState);
//       testWriteableStream.write_2.on('drain', () => {
//         console.log('estWriteableStream_1 drain buffer = 0-------------------------------------------------------------------------------');
//         testWriteableStream.write_2.end();
//       })
//       testWriteableStream.write_2.on('finish', () => {
//         console.log('estWriteableStream_2 The end-------------------------------------------------------------------------------');
//         testWriteableStream.write_2.close();
//       })
//     };


//     console.log(`testFlag=${testFlag},----------------------------------------------------------------------------------------------------`);

//     if (testFlag === 1) {
//       console.log('writeableStream_1');
//       testWriteableStream.write_1.write(`writeableStream_${testCountAll}\r\n`);
//       console.log('wtiten_1=---------------------------------------------------------------------');
//     }
//     if (testFlag === 2) {
//       console.log('writeableStream_2');
//       console.log('testWriteableStream._writableState:', testWriteableStream.write_2._writableState);
//       // console.log('testWriteableStream._writableState.onwrite :', testWriteableStream._writableState.onwrite);
//       testWriteableStream.write_2.write(`writeableStream_${testCountAll}\r\n`);
//     }
//     testCount++;
//     testCountAll++;
//   }
//   return function () {
//     return main(); // есть доступ к внешней переменной "count"
//   };
// }


// let variableWritable = TestWritable();
// // variableWritable();
// // variableWritable();

// // variableWritable();
// setInterval(() => { variableWritable() }, 100);
// let variableWritable = setInterval(TestWritable(), 100);
// // setInterval(TestWritable(), 100);
// variableWritable();

// let variableWritable = TestWritable(testWriteableStream_1, testWriteableStream_2);
// variableWritable(testWriteableStream_1, testWriteableStream_2);

// setInterval(() => {
//   // ws.onopen();
//   console.log('RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR');
//   ws.reconnect(1006, 'testReconnect websocket');
// }, 2000);
// setInterval(() => console.log('RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR'), 1000);

function wsStartBith(cmd, args, initialGate, writableFiles) {
  // let variableWritable = TestWritable(testWriteableStream_1, testWriteableStream_2);
  const params = JSON.stringify({
    "cmd": cmd,
    "args": [args]
  });

  let ping;

  function startPing() {
    ping = setInterval(function () {
      console.log('ping');
      console.log('new', new Date().getTime());
      ws.send(JSON.stringify({ "cmd": "ping" }));
      // process.exit();
    }, 10000);
  }

  function stopPing() {
    clearInterval(ping);
  }



  ws.onopen = function () {
    console.log('open');
    console.log('countReconnect=', countReconnect);
    console.log('countReconnectCode0=', countReconnectCode0);
    countReconnect++;
    ws.send(params);
    // startPing();
    // if (countReconnect > -1) {
    //   ws.reconnect(1006, 'testReconnect websocket');
    // }
    // ws.reconnect(1006, 'testReconnect websocket');
    // process.exit();
  };

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
    console.log('BITHUMB message%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
    // variableWritable();
    // variableWritable();
    // for (let i = 0; i < 30; i++) {
    // TestWritable(testWriteableStream_1, testWriteableStream_2, testFlag, testCount, testCountAll);
    // variableWritable();
    // TestWritable(testWriteableStream_1, testWriteableStream_2);
    // console.log('counter():', counter());
    // }
    // TestWritable2(testWriteableStream_1, testWriteableStream_2, testFlag, testCount, testCountAll);
    // countReconnect++; // тест реконнекта websocket, повторить на Gate
    // if (countReconnect === 7) {
    //   ws.reconnect(1006, 'testReconnect websocket');
    // }
    console.log('countReconnect=', countReconnect);
    console.log('countReconnectCode0=', countReconnectCode0);
    console.log('countReconnectConsistenBOOK=', countReconnectConsistenBOOK);
    initialBith.messageObj = JSON.parse(message.data); //utf8Data  с сервера это строка преобразуем в объект
    // test
    console.log('onmessage Gate initialBith.messageObj.timestamp=', initialBith.messageObj.timestamp);

    // timeNaw = initialBith.messageObj.timestamp;
    timeNaw = new Date().getTime();;

    console.log('timeNaw=', timeNaw);
    console.log('timeStart=', timeStart);

    colMessage++;
    let varPeriod = timeNaw - timePrevious;
    if (colMessage > 20 && varPeriod > maxTimePeriod) { maxTimePeriod = varPeriod }
    timeAll = Math.round((timeNaw - timeStart) / 1000);
    let viewMAxTimePeriod = Math.round((maxTimePeriod) / 1000);
    console.log(` BITHUMB viewMAxTimePeriod=${viewMAxTimePeriod}, colMessage=${colMessage}, timeNaw=${timeNaw}, time All=${timeAll}`);
    console.log('countReconnect=', countReconnect);
    console.log('countReconnectCode0=', countReconnectCode0);
    timePrevious = timeNaw;
    if (timeAll > 300) {
      console.log('|Time OUT 5 min test');
      process.exit();
    }


    console.log('initialBith.messageObj:SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', initialBith.messageObj);

    console.log(`code= ${initialBith.messageObj.code}, msg = ${initialBith.messageObj.msg} `);
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
    // if (initialBith.messageObj.msg && initialBith.messageObj.msg === 'Pong') {
    //   console.log('!pong2');
    //   process.exit();
    // }

    // if (initialBith.messageObj.code && initialBith.messageObj.code === '0') {
    //   console.log('!00000000');
    //   process.exit();
    // }
    // if (initialBith.messageObj.code && initialBith.messageObj.code === '0') {
    //   countReconnectCode0++;
    //   timeCode0 = new Date().getTime();
    //   console.log('timeCode0=', timeCode0);
    //   flagCode0 = true;

    //   return ws.reconnect(1006, 'initialBith.messageObj.code === 0');
    // }
    if (initialBith.messageObj.code === "00006") {
      initialBith.ver = Number(initialBith.messageObj.data.ver);
      allOrderbookBay = initialBith.messageObj.data.b.slice();
      allOrderbookSell = initialBith.messageObj.data.s.slice();
      orderbookFirstPreviousBay = allOrderbookBay[0].slice();
      // console.log('allOrderbookBay 00006=', allOrderbookBay);
      // console.log('allOrderbookSell 00006=', allOrderbookSell);

      console.log('allOrderbookBay 00006 5 ***************************************************');
      for (let i = 0; i < 5; i++) {
        console.log(allOrderbookBay[i]);
        // console.log(allOrderbookSell[i]);
      }

      console.log('orderbookFirstPreviousBay 00006=', orderbookFirstPreviousBay);
      // orderbookFirstPreviousSell = Number(allOrderbookSell.slice(0, 1));
      console.log('TEST 00006 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');//для отладки себе включить
      time00006 = new Date().getTime();
      console.log('time00006=', time00006);
      flag00006 = true;



      // initialBith.messageObj.data.b.forEach((elem, i) => console.log(`${i}:`, elem));
      // initialBith.messageObj.data.s.forEach((elem, i) => console.log(`${i}:`, elem));
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
      console.log('00007***************************************************');
      console.log('time Naw=', new Date().getTime());
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
        if (initialBith.messageObj.data.b.length === 1) orderbookChange(allOrderbookBay, initialBith.messageObj.data.b, true)
        if (initialBith.messageObj.data.s.length === 1) orderbookChange(allOrderbookSell, initialBith.messageObj.data.s, false)

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
        if (changeFirstOrderbook(orderbookFirstPreviousBay, allOrderbookBay)) {
          initialBith.bay = Number(allOrderbookBay[0][0]);

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
          // initialBith.messageEdit = {
          //   b: initialBith.messageObj.data.b,
          //   s: initialBith.messageObj.data.s,
          //   ver: initialBith.messageObj.data.ver
          //   // timestamp: initialBith.baySellTimestamp,
          // };

          // bayGate: initialGate.priceAndComissionsBay,
          // bayBith: initialBith.priceAndComissionsBay,
          // sellGate: initialGate.priceAndComissionsSell,
          // sellBith: initialBith.priceAndComissionsSell,
          // timeServer: new Date().getTime(),
          // timeBith: initialBith.baySellTimestamp,
          // timeGate: initialGate.timeGate,
          // bayOrSellGate: initialGate.bayOrSell,
          // init: 0,
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
            // const paramsGoTrade = {
            //   bayGate: initialGate.priceAndComissionsBay,
            //   bayBith: initialBith.priceAndComissionsBay,
            //   sellGate: initialGate.priceAndComissionsSell,
            //   sellBith: initialBith.priceAndComissionsSell,
            //   timeServer: new Date().getTime(),
            //   timeBith: initialBith.baySellTimestamp,
            //   timeGateSell: initialGate.sellTimestamp,
            //   timeGateBuy: initialGate.bayTimestamp,
            //   init: true
            // }
            // goTrade(paramsGoTrade, writableFiles);
          }
        }

        if (initialBith.messageObj.data.b.length === 1) {
          const dataBay = Number(initialBith.messageObj.data.b[0][0]);
          console.log('dataBay=', dataBay);
          // if (Number(dataBay) > 0.52) {
          //   console.log('Number(initialBith.messageObj.data.b[0][1]) > 0.52')
          //   process.exit();
          // }
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


      //  Проверяем изменился ли первый элемент ORDERBOOK на Bay и Sell
      // if (!changeFirstOrderbook(orderbookFirstPreviousBay, allOrderbookBay) &&
      //   !changeFirstOrderbook(orderbookFirstPreviousSell, allOrderbookSell)) {
      //   // for (let i = 0; i < 2; i++) {
      //   //   console.log(orderbookFirstPreviousBay[0]);
      //   //   console.log(allOrderbookBay[i]);
      //   //   console.log(orderbookFirstPreviousSell[0]);
      //   //   console.log(allOrderbookSell[i]);
      //   // }
      //   console.log('Data first element ORDERBOOK changes');
      //   // process.exit();
      // }



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
      // initialBith.messageObj.data.s.forEach((element, i, arr) => {
      //   arr[i][0] = Number(Number(element[0]) + Number(element[0]) * initialBith.takerComissions);
      //   arr[i][1] = Number(arr[i][1]);
      // });
      // initialBith.messageObj.data.b.forEach((element, i, arr) => {
      //   arr[i][0] = Number(Number(element[0]) - Number(element[0]) * initialBith.makerComissions);
      //   arr[i][1] = Number(arr[i][1]);
      // });
      console.log('Number initialBith.messageObj.data.b: ', initialBith.messageObj.data.b);//для отладки себе включить
      console.log('Number initialBith.messageObj.data.s:', initialBith.messageObj.data.s);//для отладки себе включить

      // initialBith.priceAndComissionsBay = initialBith.Bay - initialBith.Bay * initialBith.makerComissions;
      // initialBith.priceAndComissionsSell = initialBith.Sell + initialBith.Sell * initialBith.takerComissions;

      // console.log('initialBith.priceAndComissionsBay test= ', initialBith.priceAndComissionsBay);
      // console.log('initialBith.priceAndComissionsSell test= ', initialBith.priceAndComissionsSell);

      // console.log('initialBith.Bay= ', initialBith.Bay);
      // console.log('initialBith.makerComissions= ', initialBith.makerComissions);
      // console.log('initialBith.Sell= ', initialBith.Sell);
      // console.log('initialBith.takerComissions= ', initialBith.takerComissions);


      // // console.log('initialBith.messageEdit.b:', initialBith.messageEdit.b);//для отладки себе включить
      // // console.log('initialBith.messageEdit.s:', initialBith.messageEdit.s);//для отладки себе включить
      // // console.log('initialBith.messageEdit.s.length:', initialBith.messageEdit.s.length);//для отладки себе включить

      // // выбираем первые значения в стаканах на bay и sell и прибавляем комисиии
      // // console.log('Number(initialBith.messageEdit.b[0][0])=', initialBith.messageEdit.b[0]);

      // // if (!initialBith.messageEdit.b[0][0]) {

      // // }


      // initialBith.priceAndComissionsBay = Number(initialBith.messageEdit.b[0][0]) - Number(initialBith.messageEdit.b[0][0]) * initialBith.makerComissions; // Заменил taker на meker
      // initialBith.priceAndComissionsSell = Number(initialBith.messageEdit.s[0][0]) + Number(initialBith.messageEdit.s[0][0]) * initialBith.takerComissions;// Заменил meker на taker
      // console.log('initialBith.takerComissions:', initialBith.takerComissions);//для отладки себе включить
      // console.log('initialBith.makerComissions:', initialBith.makerComissions);//для отладки себе включить
      // console.log('initialBith.priceAndComissionsBay:', initialBith.priceAndComissionsBay);//для отладки себе включить
      // console.log('initialBith.priceAndComissionsSell:', initialBith.priceAndComissionsSell);//для отладки себе включить


      // if (initialGate.globalFlag) {
      //   const paramsGoTrade = {
      //     bayGate: initialGate.priceAndComissionsBay,
      //     bayBith: initialBith.priceAndComissionsBay,
      //     sellGate: initialGate.priceAndComissionsSell,
      //     sellBith: initialBith.priceAndComissionsSell,
      //     timeServer: new Date().getTime(),
      //     timeBith: initialBith.baySellTimestamp,
      //     timeGateSell: initialGate.sellTimestamp,
      //     timeGateBuy: initialGate.bayTimestamp,
      //     init: true
      //   }
      //   // goTrade(paramsGoTrade, writableFiles);
      // };

      if (initialBith.messageObj.data.b.length > 0 && initialBith.messageObj.data.s.length > 0) { // если массив существует и заполнен, то считаем норм
        console.log('initialBith.messageObj.data.b.length > 0 && initialBith.messageObj.data.s.length > 0');
        initialBith.initialWs = true;
      }
      // if (counts.countMessageAll > 10) {
      //   console.log(' counts.countMessage  if ((counts.countMessage) > 20:', counts.countMessageAll);
      //   counts.countMessageAll = 0;
      //   writeableStream.end();
      //   writeableStream.close();

      //   // if (writeableStream._writableState.closed) {
      //   let time = new Date().getTime();
      //   console.log('time:', time);

      //   writeableStream = fs.createWriteStream(`logs/profit${time}.csv`, { flags: 'a' });
      //   // }
      // }
      // if (counts.countMessageStartNew === 150) writeableStream.end();
      // if (!writeableStream._writableState.ended || !writeableStream._writableState.finished || !writeableStream._writableState.closed) {
      //   let time = new Date().getTime();
      //   console.log('time:', time);
      //   console.log('counts.countMessageStartNew 1:', counts.countMessageStartNew);
      //   // process.exit();
      //   let writeableSatus = writeableStream.write(`writeableStream_${counts.countMessageStartNew}\r\n`);
      //   console.log('writeableSatus=', writeableSatus);
      //   if (!writeableSatus) process.exit();
      //   // let stats = fs.stat("logs/profit.csv", (error, stats) => {
      //   //   if (error) {
      //   //     console.log(error);
      //   //   }
      //   //   else {
      //   //     // console.log("Stats object for: profit.csv");
      //   //     // console.log(stats);

      //   //     // Using methods of the Stats object
      //   //     // console.log("Path is file:", stats.isFile());
      //   //     // console.log("Path is directory:", stats.isDirectory());
      //   //     let fileSizeInBytes = stats["size"];
      //   //     console.log('fileSizeInBytes=', fileSizeInBytes);
      //   //     writeableStream.write(`writeableStream_${countMessageAll}_size_${fileSizeInBytes}\r\n`);
      //   //   }
      //   // });


      // } else {
      //   counts.count++;
      //   console.log('if writeableStream._writableState.ended2:', writeableStream._writableState.ended);
      //   console.log(' writeableStream._writableState.ended2 count :', counts.count);
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
