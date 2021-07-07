
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
  const data = {
    bayGate: paramsGoTrade.bayGate.round(comma),
    bayBith: paramsGoTrade.bayBith.round(comma),
    sellGate: paramsGoTrade.sellGate.round(comma),
    sellBith: paramsGoTrade.sellBith.round(comma),
    diffSell: diffSell.round(comma),
    diffBay: diffBay.round(comma),
    timeServer: paramsGoTrade.timeServer,
    timeBith: paramsGoTrade.timeBith,
    init: paramsGoTrade.init
  }
  // writtenCSV(data, writeableStream, counts);
  // }

  if ((diffSell > config.get("MIN_PROFIT") || diffBay > config.get("MIN_PROFIT"))) {
    // writableFiles();
  }

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

function TestWritable(dataSave1) {
  let testFlag = 1;
  let testCount = 0;
  let testCountAll = 1;
  // let dataSave1 = dataSave;
  const highWaterMark = 320 * 1024;
  // const headerName = [{ diffSell: 'diffSell', diffBay: 'diffBay' }];
  const headerName = 'bayGate,bayBith,sellGate,sellBith,diffSell,diffBay,timeServer,timeBith,init';
  // const data = {
  //   bayGate: paramsGoTrade.bayGate,
  //   bayBith: paramsGoTrade.bayBith,
  //   sellGate: paramsGoTrade.sellGate,
  //   sellBith: paramsGoTrade.sellBith,
  //   diffSell: diffSell,
  //   diffBay: diffBay,
  //   timeServer: paramsGoTrade.timeServer,
  //   timeBith: paramsGoTrade.timeBith,
  //   init: paramsGoTrade.init
  // }
  // {encoding: 'utf8', highWaterMark: 332 * 1024});// задать значение буфера
  // writable._writableState.getBuffer()// инфа из буффера
  let testWriteableStream = {
    write_1: fs.createWriteStream("logs/test_profit_1.csv", { flags: 'a', highWaterMark: highWaterMark }),
    write_2: fs.createWriteStream("logs/test_profit_1.csv", { flags: 'a', highWaterMark: highWaterMark })
  }

  // testWriteableStream.write_1.write(`${headerName}\r\n`);
  testWriteableStream.write_1.write(`${headerName}\n`);
  // testWriteableStream.write_2.write(`${headerName}\r\n`);
  // stringifyDate(testWriteableStream.write_1, headerName, false);
  // stringifyDate(testWriteableStream.write_2, headerName, false);
  // let testWriteableStream = {
  //   write_2: fs.createWriteStream("logs/test_profit_2.csv", { flags: 'a' })
  // }

  // console.log('testCountAll=', testCountAll);
  // console.log('function TestWritable----------------------------------------------------------------------------------------------------');
  // console.log(`testCount=${testCount}----------------------------------------------------------------------------------------------------`);
  // console.log('testWriteableStream_1.writableLength', testWriteableStream_1.write_1.writableLength);
  // console.log('testWriteableStream_1:', testWriteableStream_1.write_1);

  // if (testFlag === 2) {
  //   if (!testWriteableStream_1._writableState.finished) {
  //     if (testWriteableStream_1._writableState.length === 0) {
  //       console.log(`Stream_1 Buffer=0 ----------------------------------------------------------------------------------------------------`);
  //       testWriteableStream_1.end();
  //       testWriteableStream_1.close();
  //       // testWriteableStream_1.destroy();
  //     }
  //   }
  // }
  // if ((testFlag === 1) && (testWriteableStream_2)) {
  //   if (!testWriteableStream_2._writableState.finished) {
  //     if (testWriteableStream_2._writableState.length === 0) {
  //       // process.exit();
  //       console.log(`Stream_1 Buffer=0 ----------------------------------------------------------------------------------------------------`);
  //       testWriteableStream_2.end();
  //       testWriteableStream_2.close();
  //       // testWriteableStream_2.destroy(console.log(`testWriteableStream_2.destroy()`));
  //       console.log(`testWriteableStream_2.close() ----------------------------------------------------------------------------------------------------`);
  //     }
  //   }
  // }
  function main(dataSave1) {
    console.log('data Writable=', dataSave1);
    // process.exit();
    // let data = { diffSell: '1.000045', diffBay: '2.000045' };
    // (`${data.diffSell},${data.diffBay}\n`)
    // 'bayGate,bayBith,sellGate,sellBith,diffSell,diffBay,timeServer,timeBith,init';
    let data = `${dataSave1.bayGate},${dataSave1.bayBith},${dataSave1.sellGate},${dataSave1.sellBith},${dataSave1.diffSell},${dataSave1.diffBay},${dataSave1.timeServer},${dataSave1.timeBith},${dataSave1.init}\n`;
    //  {bayGate: dataSave1.bayGate,bayBith: dataSave1.bayBith,sellGate: dataSave1.sellGate,sellBith:dataSave1.sellBith,diffSell: dataSave1.diffSell,
    //   diffBay :dataSave1.diffBay,timeServer :dataSave1.timeServer,timeBith: dataSave1.timeBith,init: dataSave1.init};

    if (testCount >= 50) {
      testCount = 0;
      if (testFlag === 1) {
        console.log(`testFlag=${testFlag}--------------------------------------------------------------------------------------------------`);
        // testWriteableStream_1.end();
        // testWriteableStream_1.close();
        // let data = [
        //   { diffSell: '1.000045', diffBay: '2.000045' },
        //   { diffSell: '3.000045', diffBay: '4.000045' }
        // ];

        // if (writeableStream._writableState.closed) {
        // testWriteableStream.write_2.end();


        console.log('testWriteableStream.write_1._writableState=', testWriteableStream.write_1._writableState);
        console.log(' testWriteableStream.write_1._writableState.getBuffer()=', testWriteableStream.write_1._writableState.getBuffer());
        console.log(' testWriteableStream.write_1._writableState.getBuffer().length=', testWriteableStream.write_1._writableState.getBuffer().length);
        console.log('testWriteableStream.write_1.writableLength=', testWriteableStream.write_1.writableLength);
        // process.exit();
        // stringifyDate(testWriteableStream.write_2, headerName, false);
        // testWriteableStream.write_2.write(`${headerName}\r\n`);
        // testWriteableStream.write_2.write(`${headerName}\n`);
        // testWriteableStream.write_1.end();

        // console.log('testWriteableStream._writableState:', testWriteableStream.write_2._writableState);
        // testWriteableStream.write_1.on('drain', () => {
        //   // process.exit();
        //   console.log('estWriteableStream_1 drain buffer = 0----------------------------------------------------------------------------');
        //   testWriteableStream.write_1.end();
        // });
        testWriteableStream.write_2.end();
        testWriteableStream.write_2.on('finish', () => {
          console.log('estWriteableStream_2 The end-------------------------------------------------------------------------------');
          testWriteableStream.write_2.close();
          // testWriteableStream.destroy();
          // process.exit();
        });

        testWriteableStream.write_2.on('close', () => {
          console.log('estWriteableStream_2 close sas The end-------------------------------------------------------------------------------');

          let time = new Date().getTime();
          console.log('time:', time);
          testWriteableStream.write_2 = fs.createWriteStream(`logs/test2_profit_${testCountAll}_${time}.csv`, { flags: 'a', highWaterMark: highWaterMark });
          testWriteableStream.write_2.write(`${headerName}\n`);
          testFlag = 2;
          // testWriteableStream.destroy();
          // process.exit();
        });
        // testFlag = 2;
        return
      }
      // testFlag = 1;
      console.log(`testFlag=${testFlag}--------------------------------------------------------------------------------------------------`);
      // testWriteableStream.end();
      // testWriteableStream.close();

      // if (writeableStream._writableState.closed) {
      // testWriteableStream.write_1.end();

      // testWriteableStream.write_2.end();

      // console.log('testWriteableStream._writableState:', testWriteableStream.write_1._writableState);
      // testWriteableStream.write_2.on('drain', () => {
      //   console.log('estWriteableStream_1 drain buffer = 0-------------------------------------------------------------------------------');
      //   testWriteableStream.write_2.end();
      // })
      // testWriteableStream.write_2.on('finish', () => {
      //   console.log('estWriteableStream_2 The end-------------------------------------------------------------------------------');
      //   testWriteableStream.write_2.close();
      // })

      testWriteableStream.write_1.end();
      testWriteableStream.write_1.on('finish', () => {
        console.log('estWriteableStream_1 The end-------------------------------------------------------------------------------');
        testWriteableStream.write_1.close();
        // testWriteableStream.destroy();
        // process.exit();
      });

      testWriteableStream.write_1.on('close', () => {
        console.log('estWriteableStream_1 close sas The end-------------------------------------------------------------------------------');

        let time = new Date().getTime();
        console.log('time:', time);
        testWriteableStream.write_1 = fs.createWriteStream(`logs/test1_profit_${testCountAll}_${time}.csv`, { flags: 'a', highWaterMark: highWaterMark });
        testWriteableStream.write_1.write(`${headerName}\n`);
        testFlag = 1;
        // testWriteableStream.destroy();
        // process.exit();
      });
    };


    console.log(`testFlag=${testFlag},----------------------------------------------------------------------------------------------------`);

    if (testFlag === 1) {
      console.log('writeableStream_1');
      // testWriteableStream.write_1.write(`${data.diffSell},${data.diffBay}\r\n`);
      let okWritable1 = testWriteableStream.write_1.write(`${testCountAll},${data}`);
      // stringifyDate(testWriteableStream.write_1, data, false);
      // let okWritable1 = stringifyDate(testWriteableStream.write_1, data, false);
      // let okWritable1 = testWriteableStream.write_1.write(`writeableStream_${testCountAll}\r\n`);
      // console.log('okWritable1=', okWritable1);
      if (!okWritable1) {
        process.exit();
      }
      // testWriteableStream.write_1.write(okWritable1);

      console.log('wtiten_1=---------------------------------------------------------------------');
    }
    if (testFlag === 2) {
      console.log('writeableStream_2');
      console.log('testWriteableStream._writableState:', testWriteableStream.write_2._writableState);
      // console.log('testWriteableStream._writableState.onwrite :', testWriteableStream._writableState.onwrite);

      // testWriteableStream.write_2.write(`${data.diffSell},${data.diffBay}\r\n`);
      let okWritable2 = testWriteableStream.write_2.write(`${testCountAll},${data}`);

      // stringifyDate(testWriteableStream.write_2, data, false);
      // let okWritable2 = stringifyDate(testWriteableStream.write_2, data, false);
      // let okWritable2 = testWriteableStream.write_2.write(`writeableStream_${testCountAll}\r\n`);
      // console.log('okWritable2:', okWritable2);
      if (!okWritable2) {
        process.exit();
      }
      // testWriteableStream.write_2.write(okWritable2);
      // let okWritable2 = testWriteableStream.write_2.write(`writeableStream_${testCountAll}\r\n`);
      // console.log('okWritable2=', okWritable2);
      // if (!okWritable2) {
      //   process.exit();
      // }
    }
    console.log('testCountAll=', testCountAll);
    testCount++;
    testCountAll++;
  }
  return function (dataSave1) {
    return main(dataSave1); // есть доступ к внешней переменной "count"
  };
}
module.exports = { goTrade, writtenCSV, TestWritable, parseCSV, parseTest }
