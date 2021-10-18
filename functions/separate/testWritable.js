const fs = require("fs");
const { consoleLogGroup } = require('./consoleLogGroup');

function testWritable(data) {
  console.log('TestWritable(data)==============================', data);
  let testFlag = 1;
  let testCount = 0;
  let testCountAll = 1;
  const highWaterMark = 320 * 1024;
  const headerName = `Number,bayGate,bayBith,sellGate,sellBith,diffSell,diffBay,timeServer,timeGate,timeBith,percentBonus,bayOrSellGate,bayOrSellBith,init`;
  let testWriteableStream = {
    write_1: fs.createWriteStream("logs/1630000000000_0.csv", { flags: 'a', highWaterMark: highWaterMark }),
    write_2: fs.createWriteStream("logs/1630000000000_0.csv", { flags: 'a', highWaterMark: highWaterMark })
  }
  // testWriteableStream.write_1.write(`${headerName}\r\n`);
  testWriteableStream.write_1.write(`${headerName}\n`);
  function main(data) {
    console.log('data Writable=', data);
    data = `${data.bayGate},${data.bayBith},${data.sellGate},${data.sellBith},${data.diffSell},${data.diffBay},${data.timeServer},${data.timeGate},${data.timeBith},${data.percentBonus},${data.bayOrSellGate},${data.bayOrSellBith},${data.init}\n`;
    if (testCount >= 50) {
      testCount = 0;
      if (testFlag === 1) {
        console.log(`testFlag=${testFlag}----------------------------------------------------------------------------`);
        testWriteableStream.write_2.end();
        testWriteableStream.write_2.on('finish', () => {
          consoleLogGroup`estWriteableStream_2 The end-----------------------------------
          testFlag=${testFlag}-----------------------------------------------------------
          testWriteableStream.write_1._writableState.getBuffer() =${testWriteableStream.write_1._writableState.getBuffer()}
          testWriteableStream.write_1._writableState.getBuffer().length=${testWriteableStream.write_1._writableState.getBuffer().length}
          testWriteableStream.write_1.writableLength=${testWriteableStream.write_1.writableLength}`;
          testWriteableStream.write_2.close();
        });

        testWriteableStream.write_2.on('close', () => {
          console.log('estWriteableStream_2 close sas The end--------------------------------------------------------');
          let time = new Date().getTime();
          console.log('time:', time);
          testWriteableStream.write_2 = fs.createWriteStream(`logs/${time}_${testCountAll}.csv`, { flags: 'a', highWaterMark: highWaterMark });//`logs/test2_profit_${testCountAll}_${time}.csv`
          testWriteableStream.write_2.write(`${headerName}\n`);
          testFlag = 2;
        });
        return
      }
      console.log(`testFlag=${testFlag}------------------------------------------------------------------------------`);
      testWriteableStream.write_1.end();
      testWriteableStream.write_1.on('finish', () => {
        console.log('estWriteableStream_1 The end--------------------------------------------------------------------');
        testWriteableStream.write_1.close();
      });

      testWriteableStream.write_1.on('close', () => {
        console.log('estWriteableStream_1 close sas The end----------------------------------------------------------');
        let time = new Date().getTime();
        console.log('time:', time);
        testWriteableStream.write_1 = fs.createWriteStream(`logs/${time}_${testCountAll}.csv`, { flags: 'a', highWaterMark: highWaterMark });//`logs/test1_profit_${testCountAll}_${time}.csv`
        testWriteableStream.write_1.write(`${headerName}\n`);
        testFlag = 1;
      });
    };
    console.log(`testFlag=${testFlag},-------------------------------------------------------------------------------`);
    if (testFlag === 1) {
      console.log('writeableStream_1---------------------------------------------------------------------');
      let okWritable1 = testWriteableStream.write_1.write(`${testCountAll},${data}`);
      // let okWritable1 = stringifyDate(testWriteableStream.write_1, data, false);
      // if (!okWritable1) {
      //   process.exit();
      // }
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

module.exports = { testWritable }
