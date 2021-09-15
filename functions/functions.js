
const config = require('config');
const MIN_PROFIT = config.get('MIN_PROFIT');
const TIME_DEPRECAT = config.get('TIME_DEPRECAT');
const TIME_DEPRECAT_ALL = config.get('TIME_DEPRECAT');
const stringify = require('csv-stringify');
const generate = require('csv-generate');
const assert = require('assert');
const fs = require("fs");

const parse = require('csv-parse');
const TIMER_RECONNECT_MESSAGE = config.get('TIMER_RECONNECT_MESSAGE');
const TIME_STOP_TEST = config.get('TIME_STOP_TEST');


const input = '#Welcome\n"1","2","3","4"\n"a","b","c","d"'
function parseTest() {
  parse(input, {
    comment: '#'
  }, function (err, output) {
    if (err) throw err; // если возникла ошибка
    assert.deepStrictEqual(
      output,
      [['1', '2', '3', '4'], ['a', 'b', 'c', 'd']]
    )
  })
}

function goTrade(paramsGoTrade, writableFiles) {
  console.log('goTrade()----------------------------------------------------');
  const arrPrice = [paramsGoTrade.bayGate, paramsGoTrade.bayBith, paramsGoTrade.sellGate, paramsGoTrade.sellBith];
  // console.log('arrPrice=', arrPrice);
  // process.exit();
  // Если в данных есть ноль
  if (arrPrice.includes(0)) return

  // если данные устарели 1
  if (paramsGoTrade.timeServer - paramsGoTrade.timeBith > TIME_DEPRECAT || paramsGoTrade.timeServer - paramsGoTrade.timeGate > TIME_DEPRECAT) return
  // если данные устарели все 4 times
  //1629570661475
  // const arrTimesAll = [1629570640474, 1629570662475, 1629570663475, 1629570664475];
  // paramsGoTrade.timeServer = 1629570660475;
  const arrTimesAll = [paramsGoTrade.timeGateSell, paramsGoTrade.timeGateBay, paramsGoTrade.timeBithSell, paramsGoTrade.timeBithBay];
  console.log('Проверка 4 times');
  console.log('arrTimesAll=', arrTimesAll);
  console.log('arrPrice=', arrPrice);
  console.log('paramsGoTrade.timeServer=', paramsGoTrade.timeServer);
  console.log('paramsGoTrade.timeBith=', paramsGoTrade.timeBith);
  console.log('paramsGoTrade.timeGate=', paramsGoTrade.timeGate);
  const timeOutAll = arrTimesAll.some((item) => {
    if (paramsGoTrade.timeServer - item > TIME_DEPRECAT_ALL) return true
  });
  if (timeOutAll) return
  let diffSell = paramsGoTrade.bayBith - paramsGoTrade.sellGate;
  let diffBay = paramsGoTrade.bayGate - paramsGoTrade.sellBith;

  let percentBonus = 0;
  if (diffSell > 0) {
    console.log('Выгодно купить на Gate и продать на Bith = #1');
    percentBonus = diffSell / paramsGoTrade.sellGate;
    console.log('percentBonus #1 =', percentBonus);
  }

  if (diffBay > 0) {
    console.log('Выгодно продать на Gate и купить на Bith = #2');
    percentBonus = diffBay / paramsGoTrade.sellBith;
    console.log('percentBonus #2=', percentBonus);
  }
  console.log('diffSell=', diffSell);
  console.log('diffBay=', diffBay);

  Number.prototype.round = function (places) {
    return +(Math.round(this + "e+" + places) + "e-" + places);
  }

  //   var n = 1.7777;
  // n.round(2); // 1.78 .round(comma)
  const comma = 8;
  const commaPercent = 4;
  // if (diffSell > 0 || diffBay > 0) {
  console.log('paramsGoTrade.bayGate=', paramsGoTrade.bayGate);
  console.log('paramsGoTrade.sellGate=', paramsGoTrade.sellGate);

  // console.log('diffSell', config.get("MIN_PROFIT")>diffSell);
  // console.log('diffSell', config.get("MIN_PROFIT")>diffSell);

  // console.log('config.get("MIN_PROFIT")>diffSell', config.get("MIN_PROFIT")>diffSell);
  // console.log('config.get("MIN_PROFIT")>diffBay', config.get("MIN_PROFIT")>diffBay);
  if ((diffSell > config.get("MIN_PROFIT") || diffBay > config.get("MIN_PROFIT"))) {
    const data = {
      bayGate: paramsGoTrade.bayGate.round(comma),
      bayBith: paramsGoTrade.bayBith.round(comma),
      sellGate: paramsGoTrade.sellGate.round(comma),
      sellBith: paramsGoTrade.sellBith.round(comma),
      diffSell: diffSell.round(comma),
      diffBay: diffBay.round(comma),
      timeServer: paramsGoTrade.timeServer,
      timeBith: paramsGoTrade.timeBith,
      timeGate: paramsGoTrade.timeGate,
      percentBonus: percentBonus.round(commaPercent),
      bayOrSellGate: paramsGoTrade.bayOrSellGate,
      bayOrSellBith: paramsGoTrade.bayOrSellBith,
      init: paramsGoTrade.init
    }
    console.log('data========================================', data);
    writableFiles(data);
  }

  // writableFiles(data);
};


function writtenCSV(data, writeableStream, counts) {
  counts.countMessageAll++;
  counts.countMessageStartNew++;
  // console.log('writeableStream._writableState:', writeableStream._writableState);
  // console.log('writeableStream:', writeableStream);
  // console.log('writeableStream._writableState.closed', writeableStream._writableState.closed);
  console.log('writeableStream.closed', writeableStream.closed);
  // console.log('writeableStream.path:', writeableStream.path);
  console.log('writeableStream._writableState.finished:', writeableStream._writableState.finished);
  console.log('writeableStream._writableState.ended:', writeableStream._writableState.ended);
  // if (ended)
  // console.log('writeableStream:', writeableStream);
  // if (!writeableStream._writableState.ended || !writeableStream._writableState.finished || !writeableStream._writableState.closed) {


  // var tempFile = fs.createWriteStream(tempFilepath);
  // tempFile.on('open', function(fd) {
  //     http.request(url, function(res) {
  //         res.on('data', function(chunk) {
  //             tempFile.write(chunk);
  //         }).on('end', function() {
  //             tempFile.end();
  //             fs.renameSync(tempFile.path, filepath);
  //             return callback(filepath);
  //         });
  //     });
  // });

  // tempFile.on('open', function(fd) {

  if (!writeableStream._writableState.ended || !writeableStream._writableState.finished || !writeableStream.closed) {

    let time = new Date().getTime();
    console.log('time:', time);
    console.log('counts.countMessageStartNew 1:', counts.countMessageStartNew);

    const stringifyDate = stringify([
      data
    ], {
      header: true,
      columns: ['timeServer', 'timeBith', 'init', 'bayGate', 'bayBith', 'sellGate', 'sellBith', 'diffSell', 'diffBay']
      // timeServer,timeBith,init,bayGate,bayBith,sellGate,sellBith,diffSell,diffBay
    }, function (err, data) {
      // assert.equal(
      //   data,
      //   "XXX XXXX,XXXX,\n" +
      //   "YYY YYYY,YYYY,\n"
      // )
      console.log('data=', data);
      // writeableStream.write(`${data}\r\n`);
      writeableStream.write(data);
      // }).pipe(writeableStream);
    });

    // writeableStream.write(`stringifyDate_${stringifyDate}\r\n`);
    // writeableStream.write(`writeableStream_${countMessageAll}_size_${fileSizeInBytes}\r\n`);

    // writeableStream.write(`writeableStream_${counts.countMessageStartNew}\r\n`);

    // let stats = fs.stat("logs/profit.csv", (error, stats) => {
    //   if (error) {
    //     console.log(error);
    //   }
    //   else {
    //     // console.log("Stats object for: profit.csv");
    //     // console.log(stats);

    //     // Using methods of the Stats object
    //     // console.log("Path is file:", stats.isFile());
    //     // console.log("Path is directory:", stats.isDirectory());
    //     let fileSizeInBytes = stats["size"];
    //     console.log('fileSizeInBytes=', fileSizeInBytes);
    //     writeableStream.write(`writeableStream_${countMessageAll}_size_${fileSizeInBytes}\r\n`);
    //   }
    // });


  } else {
    counts.count++;
    console.log('if writeableStream._writableState.ended2:', writeableStream._writableState.ended);
    console.log(' writeableStream._writableState.ended2 count :', counts.count);
    console.log(' File not writting !!!');
  }
  // var stats = fs.statSync("myfile.txt")
  // const fileSizeInBytes = stats["size"];
  // //Convert the file size to megabytes (optional)
  // // const fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
  // // console.log('fileSizeInMegabytes:', fileSizeInMegabytes);
  // console.log('fileSizeInBytes:', fileSizeInBytes);
  console.log('counts.countMessageAll 2=', counts.countMessageAll);
  if ((counts.countMessageAll) > 10) {
    console.log(' countMessage  if ((countMessage) > 20:', counts.countMessageAll);
    counts.countMessageAll = 0;
    writeableStream.end();
    // writeableStream.close();

    // if (writeableStream._writableState.closed) {
    let time = new Date().getTime();
    console.log('time:', time);

    console.log('1----writeableStream.closed', writeableStream.closed);
    // console.log('writeableStream.path:', writeableStream.path);
    console.log('1----writeableStream._writableState.finished:', writeableStream._writableState.finished);
    console.log('1----writeableStream._writableState.ended:', writeableStream._writableState.ended);
    writeableStream = fs.createWriteStream(`logs/profit${time}.csv`, { flags: 'a' });

    console.log('2----writeableStream.closed', writeableStream.closed);
    // console.log('writeableStream.path:', writeableStream.path);
    console.log('2----writeableStream._writableState.finished:', writeableStream._writableState.finished);
    console.log('2----writeableStream._writableState.ended:', writeableStream._writableState.ended);
    // }

  }
  // let data = data;
  // { year: 'XXXX', phone: 'XXX XXXX', nocolumn: 'XXX1' },
  // { year: 'YYYY', phone: 'YYY YYYY', nocolumn: 'YYY1' }




  // columns: ['bayGate', 'bayBith', 'sellGate', 'sellBith', 'timestampServer']

  // const i = setInterval(() => {
  //   writeableStream.write(JSON.stringify(writeToFile), (err) => console.log(`wrote ${JSON.stringify(writeToFile)} to file`))
  // }, 1000)


  // let timerId = setInterval(() => stringify([
  //   // { year: 'XXXX', phone: 'XXX XXXX', nocolumn: 'XXX1', timestamp: new Date() },
  //   // { year: 'YYYY', phone: 'YYY YYYY', nocolumn: 'YYY1', timestamp: new Date() }
  //   { year: 'XXXX', phone: 'XXX XXXX', nocolumn: 'XXX1', timestamp: new Date() },
  //   { year: 'YYYY', phone: 'YYY YYYY', nocolumn: 'YYY1', timestamp: new Date() }
  // ], {
  //   columns: ['phone', 'year', 'nocolumn', 'timestamp']
  // }, function (err, data) {
  //   writeableStream.write(data, (err) => console.log(`wrote ${data} to file`))
  //   // assert.equal(
  //   //   data,
  //   //   "XXX XXXX,XXXX,\n" +
  //   //   "YYY YYYY,YYYY,\n"
  //   // )
  //   console.log('data=', data);
  // }), 2000);

  // let timerId = setInterval(() => stringify([
  //   { year: 'XXXX', phone: 'XXX XXXX', nocolumn: 'XXX1' },
  //   { year: 'YYYY', phone: 'YYY YYYY', nocolumn: 'YYY1' }
  // ], {
  //   columns: ['phone', 'year', 'nocolumn']
  // }, function (err, data) {
  //   // assert.equal(
  //   //   data,
  //   //   "XXX XXXX,XXXX,\n" +
  //   //   "YYY YYYY,YYYY,\n"
  //   // )
  //   console.log('data=', data);
  // }).pipe(writeableStream), 2000);


  writeableStream.on('open', () => {
    console.log('open File !!!');
  });
  writeableStream.once('finish', () => {
    console.log('wrote all data to file');
  });
}

function stringifyDate(writeableStream, data, header) {
  stringify(
    data
    , {
      header: header,
      // columns: ['timeServer', 'timeBith', 'init', 'bayGate', 'bayBith', 'sellGate', 'sellBith', 'diffSell', 'diffBay']
      columns: ['diffSell', 'diffBay']
      // timeServer,timeBith,init,bayGate,bayBith,sellGate,sellBith,diffSell,diffBay
    }, function (err, data) {
      // assert.equal(
      //   data,
      //   "XXX XXXX,XXXX,\n" +
      //   "YYY YYYY,YYYY,\n"
      // )
      console.log('data=', data);
      // writeableStream.write(`${data}\r\n`);

      console.log('_writableState.length=', writeableStream._writableState.length);
      let okWritable = writeableStream.write(data);
      console.log('okWritable=', okWritable);
      if (!okWritable) {
        process.exit();
      }
      // return data;
      // }).pipe(writeableStream);
    });
}

function testWritable(data) {

  console.log('TestWritable(data)==============================', data);
  let testFlag = 1;
  let testCount = 0;
  let testCountAll = 1;
  const highWaterMark = 320 * 1024;
  const headerName = `Number,bayGate,bayBith,sellGate,sellBith,diffSell,diffBay,timeServer,timeGate,timeBith,percentBonus,bayOrSellGate,bayOrSellBith,init`;
  let testWriteableStream = {
    write_1: fs.createWriteStream("logs/test_profit_1.csv", { flags: 'a', highWaterMark: highWaterMark }),
    write_2: fs.createWriteStream("logs/test_profit_1.csv", { flags: 'a', highWaterMark: highWaterMark })
  }

  // testWriteableStream.write_1.write(`${headerName}\r\n`);
  testWriteableStream.write_1.write(`${headerName}\n`);
  // stringifyDate(testWriteableStream.write_1, headerName, false);
  function main(data) {
    console.log('data Writable=', data);
    data = `${data.bayGate},${data.bayBith},${data.sellGate},${data.sellBith},${data.diffSell},${data.diffBay},${data.timeServer},${data.timeGate},${data.timeBith},${data.percentBonus},${data.bayOrSellGate},${data.bayOrSellBith},${data.init}\n`;
    if (testCount >= 50) {
      testCount = 0;
      if (testFlag === 1) {
        console.log(`testFlag=${testFlag}--------------------------------------------------------------------------------------------------`);
        // console.log('testWriteableStream.write_1._writableState=', testWriteableStream.write_1._writableState);
        console.log(' testWriteableStream.write_1._writableState.getBuffer()=', testWriteableStream.write_1._writableState.getBuffer());
        console.log(' testWriteableStream.write_1._writableState.getBuffer().length=', testWriteableStream.write_1._writableState.getBuffer().length);
        console.log('testWriteableStream.write_1.writableLength=', testWriteableStream.write_1.writableLength);
        testWriteableStream.write_2.end();
        testWriteableStream.write_2.on('finish', () => {
          console.log('estWriteableStream_2 The end-------------------------------------------------------------------------------');
          testWriteableStream.write_2.close();
        });

        testWriteableStream.write_2.on('close', () => {
          console.log('estWriteableStream_2 close sas The end-------------------------------------------------------------------------------');
          let time = new Date().getTime();
          console.log('time:', time);
          testWriteableStream.write_2 = fs.createWriteStream(`logs/test2_profit_${testCountAll}_${time}.csv`, { flags: 'a', highWaterMark: highWaterMark });
          testWriteableStream.write_2.write(`${headerName}\n`);
          testFlag = 2;

          // process.exit();
        });
        return
      }
      console.log(`testFlag=${testFlag}--------------------------------------------------------------------------------------------------`);
      testWriteableStream.write_1.end();
      testWriteableStream.write_1.on('finish', () => {
        console.log('estWriteableStream_1 The end-------------------------------------------------------------------------------');
        testWriteableStream.write_1.close();
      });

      testWriteableStream.write_1.on('close', () => {
        console.log('estWriteableStream_1 close sas The end-------------------------------------------------------------------------------');
        let time = new Date().getTime();
        console.log('time:', time);
        testWriteableStream.write_1 = fs.createWriteStream(`logs/test1_profit_${testCountAll}_${time}.csv`, { flags: 'a', highWaterMark: highWaterMark });
        testWriteableStream.write_1.write(`${headerName}\n`);
        testFlag = 1;
      });
    };
    console.log(`testFlag=${testFlag},----------------------------------------------------------------------------------------------------`);

    if (testFlag === 1) {
      console.log('writeableStream_1');
      let okWritable1 = testWriteableStream.write_1.write(`${testCountAll},${data}`);
      // let okWritable1 = stringifyDate(testWriteableStream.write_1, data, false);
      // if (!okWritable1) {
      //   process.exit();
      // }
      console.log('wtiten_1=---------------------------------------------------------------------');
    }
    if (testFlag === 2) {
      console.log('writeableStream_2');
      // console.log('testWriteableStream._writableState:', testWriteableStream.write_2._writableState);
      let okWritable2 = testWriteableStream.write_2.write(`${testCountAll},${data}`);

      // stringifyDate(testWriteableStream.write_2, data, false);
      // if (!okWritable2) {
      // process.exit();
      // }
    }
    console.log('testCountAll writting=', testCountAll);
    testCount++;
    testCountAll++;
  }
  return function (data) {
    return main(data); // есть доступ к внешней переменной "count"
  };
}

function closure(name) {
  let count = 0;
  function main(name) {
    console.log(`${name} count=`, count);
    count++;
  }
  return (name) => main(name)
}

let variableClosure = closure();
let variableClosure2 = closure();

function changeTradeArr(initialObj) {
  console.log('initialObj.name=', initialObj.name);
  let bay = initialObj.bay;
  let sell = initialObj.sell;
  let trueBay = false;
  let trueSell = false;
  let bayOrSell = -1;
  // initialObj.bayOrSell = -1; // для исключения влияния предыдущего значения опроса
  variableClosure('1');//count= 0
  // выход при устаревании данных
  // if ()
  //  Инициализация первых предыдущих значений
  // проверка изменения значения для предотвращения лишних вычислений
  if (initialObj.orderbookFirstPreviousBay && bay != initialObj.orderbookFirstPreviousBay) {
    console.log('function changeTradeArr() initialObj.orderbookFirstPreviousBay=', initialObj.orderbookFirstPreviousBay);
    console.log('function changeTradeArr() initialObj.bay=', bay);
    // process.exit();

    bayOrSell = 1;
    initialObj.timeBay = new Date().getTime();
    initialObj.orderbookFirstPreviousBay = bay;
    console.log('bay=', bay);
    initialObj.priceAndComissionsBay = bay - bay * initialObj.takerComissions;//  bay=bids это покупатели, клиенты продают самая выгодня цена для клиентов самая высокая, комиссию отнимаем
    trueBay = true;
  }
  if (initialObj.orderbookFirstPreviousSell && sell != initialObj.orderbookFirstPreviousSell) {
    // Если одновременно изменения и в bay и в sell
    if (bayOrSell === 1) {
      bayOrSell = 2;
    } else {
      bayOrSell = 0;
    }
    initialObj.timeSell = new Date().getTime();
    initialObj.orderbookFirstPreviousSell = sell;
    console.log('sell=', sell);
    initialObj.priceAndComissionsSell = sell + sell * initialObj.makerComissions; // sell=asks это продавцы, клиенты покупатели, самая выгодня цена для клиентов самая низкая, комиссию плюсуем
    trueSell = true;
  }

  if ((trueBay || trueSell) && (initialObj.priceAndComissionsSell && initialObj.priceAndComissionsBay)) {
    initialObj.bayOrSell = bayOrSell;
    variableClosure2('2');
    // console.log('changeTradeArr()');
    // process.exit();
    return true
  }

  return false
}

function reconnectTimeMessageClosure(ws) {
  let count = 0;// для разогрева - т.е не сразу начинать
  let timeoutHandle;

  function start() {
    timeoutHandle = setTimeout(function () {
      console.log('Reconnect setTimeout messages');
      count = 0;
      return ws.reconnect(1006, 'Reconnect error');
    }, TIMER_RECONNECT_MESSAGE);
  }

  function stop() {
    clearTimeout(timeoutHandle);
  }

  function startReconnect() {
    count++;
    console.log('function  count=', count);
    if (count > 1) { // действие reconnect только после второго запуска функции
      console.log('start time');
      stop();
      start();
    }
  }
  return (ws) => startReconnect(ws)
}

function closureTimeStopTest() {
  let colMessage = 0;
  let maxTimePeriod = 0;
  let timeAll = 0;
  let timePrevious = 0;
  const timeStart = new Date().getTime();
  function main(obj) {//{countReconnect, countErrors,name:initialBith.name}
    let timeNaw = new Date().getTime();
    console.log('timeNaw=', timeNaw);
    console.log('timeStart=', timeStart);
    colMessage++;
    console.log('colMessage======================================================', colMessage);

    let varPeriod = timeNaw - timePrevious;
    if (colMessage > 20 && varPeriod > maxTimePeriod) { maxTimePeriod = varPeriod }
    timeAll = Math.round((timeNaw - timeStart) / 1000);// переводим микросекунды в секунды
    let viewMAxTimePeriod = Math.round((maxTimePeriod) / 1000);
    console.log(`${obj.name} viewMAxTimePeriod=${viewMAxTimePeriod}, colMessage=${colMessage}, timeNaw=${timeNaw}, time All=${timeAll}`);
    timePrevious = timeNaw;
    if (timeAll > TIME_STOP_TEST) {
      const strCounts = `countReconnect = ${obj.countReconnect}
      countErrors = ${obj.countErrors}
      |Time OUT sec stop = ${TIME_STOP_TEST}`
      consoleLogGroup(strCounts);
      process.exit();
    }
  }
  return (obj) => main(obj)
}

// function consoleGroupLog(objVars, optionalArr = []) {
//   if (optionalArr.length != 0) optionalArr.forEach((item) => console.log(item));
//   for (let key in objVars) console.log(`${key} = `, objVars[key]);
// }

// удаляем лишние пробелы для устранения эффекта форматирования шаблонных строк VSCode.
function consoleLogGroup(str) {
  console.log(str.split('\n').map((item) => item.trim()).join('\n'));
}
// определение средней разницы времени между своим серверным в момент получения сообщения и временем записанном в объекте биржы в момент создания ею сообщения


// function changeTrade(initialGate) {
//   if (initialGate.messageObj.result.u > initialGate.ver) {
//     initialGate.ver = initialGate.messageObj.result.u;
//     if (initialGate.messageObj.result.b) {
//       if (Number(initialGate.messageObj.result.b) != initialGate.bay) {
//         initialGate.bayOrSell = 1;
//         initialGate.bay = Number(initialGate.messageObj.result.b);
//         // расчет учитывая комиссии + дополнительная комиссия за счет не самого лучшего значения ордеров speedComissions
//         initialGate.priceAndComissionsBay = initialGate.bay - initialGate.bay * initialGate.takerComissions
//           - initialGate.bay * initialGate.speedComissions;//  bay=bids это покупатели, клиенты продают самая выгодня цена для клиентов самая высокая, комиссию отнимаем
//         console.log('Change bay:', initialGate.bay);
//         console.log('initialGate.priceAndComissionsBay-------------------:', initialGate.priceAndComissionsBay);//для отладки себе включить

//       }
//     }
//     if (initialGate.messageObj.result.a) {
//       if (Number(initialGate.messageObj.result.a) != initialGate.sell) {
//         initialGate.bayOrSell = 0;
//         initialGate.sell = Number(initialGate.messageObj.result.a);
//         // расчет учитывая комиссии + дополнительная комиссия за счет не самого лучшего значения ордеров speedComissions
//         initialGate.priceAndComissionsSell = initialGate.sell + initialGate.sell * initialGate.makerComissions
//           + initialGate.sell * initialGate.speedComissions; // sell=asks это продавцы, клиенты покупатели, самая выгодня цена для клиентов самая низкая, комиссию плюсуем
//         console.log('Change sell:', initialGate.sell);
//         console.log('initialGate.priceAndComissionsSell------------------:', initialGate.priceAndComissionsSell);//для отладки себе включить
//       }
//     }
//   }
// }

module.exports = { goTrade, writtenCSV, testWritable, parseTest, changeTradeArr, reconnectTimeMessageClosure, closureTimeStopTest, consoleLogGroup }
