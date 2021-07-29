
const config = require('config');
const MIN_PROFIT = config.get('MIN_PROFIT');
const stringify = require('csv-stringify');
const generate = require('csv-generate');
const assert = require('assert');
const fs = require("fs");

const parse = require('csv-parse');

function parseCSV() {
  fs.readFile("./logs/test_profit_12.csv", "utf8",
    function (error, input) {
      console.log("Асинхронное чтение файла");
      if (error) throw error; // если возникла ошибка
      // console.log('data file:', data);
      parse(input, {
        comment: '#',
        // columns: ['col', 'bayGate', 'bayBith', 'sellGate', 'sellBith', 'diffSell', 'diffBay', 'timeServer', 'timeBith', 'init']
      }, function (err, output) {
        if (err) throw err; // если возникла ошибка
        console.log('output=', output);
        // assert.deepStrictEqual(
        //   output,
        //   [ [ '1', '2', '3', '4' ], [ 'a', 'b', 'c', 'd' ] ]
        // )
      })

    });
}



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
  console.log('goTrade()----------------------------------------------------')
  // if (!writeableStream._writableState.ended || !writeableStream._writableState.finished || !writeableStream._writableState.closed)

  // let counts = {
  //   count: 0,
  //   countMessageAll: 0,
  //   countMessageStartNew: 0
  // }

  let diffSell = paramsGoTrade.bayBith - paramsGoTrade.sellGate;
  let diffBay = paramsGoTrade.bayGate - paramsGoTrade.sellBith;

  if (diffSell > 0) {
    console.log('Выгодно купить на Gate и продать на Bith = #1');
    const percentBonus = diffSell / paramsGoTrade.sellGate;
    console.log('percentBonus #1 =', percentBonus);
  }

  if (diffBay > 0) {
    console.log('Выгодно продать на Gate и купить на Bith = #2');
    const percentBonus = diffBay / paramsGoTrade.sellBith;
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
  // if (diffSell > 0 || diffBay > 0) {
  console.log('paramsGoTrade.bayGate=', paramsGoTrade.bayGate);
  console.log('paramsGoTrade.sellGate=', paramsGoTrade.sellGate);
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
    bayOrSellGate: paramsGoTrade.bayOrSellGate,
    bayOrSellBith: paramsGoTrade.bayOrSellBith,
    init: paramsGoTrade.init
  }
  console.log('data goTrade=', data);
  // process.exit();
  // writtenCSV(data, writeableStream, counts);
  // }
  // timeGate: initialGate.timeGate,
  // bayOrSellGate: bayOrSell,
  // init: 0,

  if ((diffSell > config.get("MIN_PROFIT") || diffBay > config.get("MIN_PROFIT"))) {
    // writableFiles();
  }
  console.log('data========================================', data);
  writableFiles(data);
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

function TestWritable(data) {

  console.log('TestWritable(data)==============================', data);
  let testFlag = 1;
  let testCount = 0;
  let testCountAll = 1;
  const highWaterMark = 320 * 1024;
  const headerName = `Number,bayGate,bayBith,sellGate,sellBith,diffSell,diffBay,timeServer,timeBith,timeGate,bayOrSellGate,bayOrSellBith, init`;
  let testWriteableStream = {
    write_1: fs.createWriteStream("logs/test_profit_1.csv", { flags: 'a', highWaterMark: highWaterMark }),
    write_2: fs.createWriteStream("logs/test_profit_1.csv", { flags: 'a', highWaterMark: highWaterMark })
  }

  // testWriteableStream.write_1.write(`${headerName}\r\n`);
  testWriteableStream.write_1.write(`${headerName}\n`);
  // stringifyDate(testWriteableStream.write_1, headerName, false);
  function main(data) {
    console.log('data Writable=', data);
    data = `${data.bayGate},${data.bayBith},${data.sellGate},${data.sellBith},${data.diffSell},${data.diffBay},${data.timeServer},${data.timeBith},${data.timeGate},${data.bayOrSellGate},${data.bayOrSellBith},${data.init}\n`;
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
    console.log('testCountAll=', testCountAll);
    testCount++;
    testCountAll++;
  }
  return function (data) {
    return main(data); // есть доступ к внешней переменной "count"
  };
}

function closure() {
  let count = 0;
  function main() {
    console.log('count=', count);
    count++;
  }
  return function () {
    return main()
  }
}

let variableClosure = closure();
let variableClosure2 = closure();

function changeTradeArr(initialObj) {
  let bay = initialObj.bay;
  let sell = initialObj.sell;
  let trueBay = false;
  let trueSell = false;
  initialObj.bayOrSell = -1; // для исключения влияния предыдущего значения опроса
  console.log('variableClosure1');
  variableClosure();//count= 0



  //  Инициализация первых предыдущих значений
  console.log('1 Boolean(initialObj.orderbookFirstPreviousBay)=', Boolean(initialObj.orderbookFirstPreviousBay));
  console.log('1 initialObj.orderbookFirstPreviousBay=', initialObj.orderbookFirstPreviousBay);
  // проверка изменения значения для предотвращения лишних вычислений




  if (initialObj.orderbookFirstPreviousBay && bay != initialObj.orderbookFirstPreviousBay) {
    initialObj.bayOrSell = 1;
    initialObj.orderbookFirstPreviousBay = bay;
    console.log('bay=', bay);
    initialObj.priceAndComissionsBay = bay - bay * initialObj.takerComissions;//  bay=bids это покупатели, клиенты продают самая выгодня цена для клиентов самая высокая, комиссию отнимаем
    trueBay = true;
    console.log('trueBay = true');
    // process.exit();
  }
  if (initialObj.orderbookFirstPreviousSell && sell != initialObj.orderbookFirstPreviousSell) {
    // Если одновременно изменения и в bay и в sell
    if (initialObj.bayOrSell === 1) {
      initialObj.bayOrSell = 2;
    } else {
      initialObj.bayOrSell = 0;
    }
    initialObj.orderbookFirstPreviousSell = sell;
    console.log('typeof sell changeTradeArr()', typeof sell);
    console.log('sell changeTradeArr()', sell);
    console.log('typeof initialObj.makerComissions changeTradeArr()', typeof initialObj.makerComissions);
    console.log('initialObj.makerComissions changeTradeArr()', initialObj.makerComissions);
    initialObj.priceAndComissionsSell = sell + sell * initialObj.makerComissions; // sell=asks это продавцы, клиенты покупатели, самая выгодня цена для клиентов самая низкая, комиссию плюсуем
    console.log('initialObj.priceAndComissionsSell changeTradeArr()=', initialObj.priceAndComissionsSell);
    trueSell = true;
    console.log('trueSell = true');
    // process.exit();
  }
  console.log('initialObj.orderbookFirstPreviousBay=', initialObj.orderbookFirstPreviousBay);
  console.log('initialObj.orderbookFirstPreviousSell=', initialObj.orderbookFirstPreviousSell);
  console.log('2 Boolean(initialObj.orderbookFirstPreviousBay)=', Boolean(initialObj.orderbookFirstPreviousBay));
  console.log('bay changeTradeArr()=', bay);
  console.log('sell changeTradeArr()=', sell);
  console.log('initialObj.priceAndComissionsBay changeTradeArr()=', initialObj.priceAndComissionsBay);
  console.log('initialObj.priceAndComissionsSell changeTradeArr()=', initialObj.priceAndComissionsSell);
  // initialObj.priceAndComissionsSell = 100;
  // initialObj.priceAndComissionsBay = 100;
  console.log(' 100 initialObj.priceAndComissionsSell changeTradeArr()=', initialObj.priceAndComissionsSell);
  console.log(' 100 initialObj.priceAndComissionsBay changeTradeArr()=', initialObj.priceAndComissionsBay);


  // if (Boolean(initialObj.orderbookFirstPreviousBay) && Boolean(initialObj.orderbookFirstPreviousSell)) {
  //   console.log('typeof initialObj.orderbookFirstPreviousBay=', typeof initialObj.orderbookFirstPreviousBay);
  //   console.log('typeof bay=', typeof bay);
  //   process.exit();
  // }

  if (!Boolean(initialObj.orderbookFirstPreviousBay)) {
    initialObj.orderbookFirstPreviousBay = bay;
    console.log('!orderbookFirstPreviousBay');
  }
  if (!Boolean(initialObj.orderbookFirstPreviousSell)) {
    initialObj.orderbookFirstPreviousSell = sell;
    console.log('!orderbookFirstPreviousSell');
  }

  if ((trueBay || trueSell) && (initialObj.priceAndComissionsSell && initialObj.priceAndComissionsBay)) {
    console.log('variableClosure2');
    variableClosure2();
    return true
  }

  return false
}

function reconnectBithClosure(ws) {
  let count = 0;// для разогрева - т.е не сразу начинать
  let timeoutHandle;
  let flag = false;

  function start() {
    timeoutHandle = setTimeout(function () {
      console.log('Reconnect setTimeout');
      count = 0;
      return ws.reconnect(1006, 'Reconnect error');
    }, 20000);
  }

  function stop() {
    clearTimeout(timeoutHandle);
  }

  function startReconnect() {
    count++;
    console.log('function  count=', count);
    if (count > 1) {
      if (!flag) {
        flag = true;
        start();
        console.log('start time');
      }
      stop();
      start();
    }
  }
  return function (ws) {
    return startReconnect(ws);
  }
}
module.exports = { goTrade, writtenCSV, TestWritable, parseCSV, parseTest, changeTradeArr, reconnectBithClosure }
