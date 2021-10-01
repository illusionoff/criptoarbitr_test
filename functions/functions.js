const util = require('util');
const config = require('config');
const assert = require('assert');
const fs = require("fs");
const parse = require('csv-parse');

const { coinConfigBith } = require('./bith/coinConfigBith');
const { changeTradeArr } = require('./separate/changeTradeArr');
const { consoleLogGroup } = require('./separate/consoleLogGroup');
const { timerClosure } = require('./separate/timerClosure');
// const { funStartPing, funEndPing, funStartReconnect } = require('./separate/timeClosure/funsStartEnd');
const { funEndPing, funStartReconnect } = require('./separate/timeClosure/funsEndReconnect');
const { funStartPingBith } = require('./bith/funStartPingBith');
const { funStartPingGate } = require('./gate/funStartPingGate');
const { timeStopTestClosure } = require('./separate/timeStopTestClosure');
const { maxPercentCupClosure } = require('./gate/maxPercentCupClosure');
const { goTrade } = require('./separate/goTrade');

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
          testWriteableStream.write_2 = fs.createWriteStream(`logs/test2_profit_${testCountAll}_${time}.csv`, { flags: 'a', highWaterMark: highWaterMark });
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
        testWriteableStream.write_1 = fs.createWriteStream(`logs/test1_profit_${testCountAll}_${time}.csv`, { flags: 'a', highWaterMark: highWaterMark });
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

// function changeTradeArr(initialObj) {
//   console.log('initialObj.name=', initialObj.name);
//   let bay = initialObj.bay;
//   let sell = initialObj.sell;
//   let trueBay = false;
//   let trueSell = false;
//   let bayOrSell = -1;
//   // initialObj.bayOrSell = -1; // для исключения влияния предыдущего значения опроса
//   // проверка изменения значения для предотвращения лишних вычислений
//   if (initialObj.orderbookFirstPreviousBay && bay != initialObj.orderbookFirstPreviousBay) {
//     console.log('changeTradeArr() initialObj.orderbookFirstPreviousBay=', initialObj.orderbookFirstPreviousBay);
//     console.log('changeTradeArr() initialObj.bay=', bay);
//     bayOrSell = 1;
//     initialObj.timeBay = new Date().getTime();
//     initialObj.orderbookFirstPreviousBay = bay;
//     console.log('bay=', bay);
//     initialObj.priceAndComissionsBay = bay - bay * initialObj.takerComissions;//  bay=bids это покупатели, клиенты продают самая выгодня цена для клиентов самая высокая, комиссию отнимаем
//     trueBay = true;
//   }
//   if (initialObj.orderbookFirstPreviousSell && sell != initialObj.orderbookFirstPreviousSell) {
//     // Если одновременно изменения и в bay и в sell
//     if (bayOrSell === 1) bayOrSell = 2
//     else bayOrSell = 0;

//     initialObj.timeSell = new Date().getTime();
//     initialObj.orderbookFirstPreviousSell = sell;
//     console.log('sell=', sell);
//     initialObj.priceAndComissionsSell = sell + sell * initialObj.makerComissions; // sell=asks это продавцы, клиенты покупатели, самая выгодня цена для клиентов самая низкая, комиссию плюсуем
//     trueSell = true;
//   }

//   if ((trueBay || trueSell) && (initialObj.priceAndComissionsSell && initialObj.priceAndComissionsBay)) {
//     initialObj.bayOrSell = bayOrSell;
//     return true
//   }
//   return false
// }

// function reconnectTimeMessageClosure(ws) {
//   let count = 0;// для разогрева - т.е не сразу начинать
//   let timeoutHandle;

//   function start() {
//     timeoutHandle = setTimeout(function () {
//       console.log('Reconnect setTimeout messages');
//       count = 0;
//       return ws.reconnect(1006, 'Reconnect error');
//     }, TIMER_RECONNECT_MESSAGE);
//   }

//   function stop() {
//     clearTimeout(timeoutHandle);
//   }

//   function startReconnect() {
//     count++;
//     console.log('function  count=', count);
//     if (count > 1) { // действие reconnect только после второго запуска функции
//       console.log('start timer');
//       stop();
//       start();
//     }
//   }
//   return (ws) => startReconnect(ws)
// }

// function timeStopTestClosure() {
//   let colMessage = 0;
//   let maxTimePeriod = 0;
//   let timeAll = 0;
//   let timePrevious = 0;
//   const timeStart = new Date().getTime();

//   function main(obj) {//{countReconnect, countErrors,name:initialBith.name}
//     let timeNaw = new Date().getTime();
//     colMessage++;
//     let varPeriod = timeNaw - timePrevious;
//     if (colMessage > 20 && varPeriod > maxTimePeriod) { maxTimePeriod = varPeriod }
//     timeAll = Math.round((timeNaw - timeStart) / 1000);// переводим микросекунды в секунды
//     let viewMAxTimePeriod = Math.round((maxTimePeriod) / 1000);

//     consoleLogGroup`timeNaw= ${timeNaw}
//     timeStart=${timeStart}
//     colMessage=${colMessage}
//     ${obj.name}, Ver: ${VERSION}, viewMAxTimePeriod=${viewMAxTimePeriod}, colMessage=${colMessage}, timeNaw=${timeNaw}, time All=${timeAll}`;

//     timePrevious = timeNaw;
//     if (timeAll > TIME_STOP_TEST) {
//       consoleLogGroup`countReconnect = ${obj.countReconnect}
//       countErrors = ${obj.countErrors}
//       |Time OUT sec stop = ${TIME_STOP_TEST}`;
//     }
//   }
//   return (obj) => main(obj)
// }

// function consoleGroupLog(objVars, optionalArr = []) {
//   if (optionalArr.length != 0) optionalArr.forEach((item) => console.log(item));
//   for (let key in objVars) console.log(`${key} = `, objVars[key]);
// }

// function consoleLogGroup(strings, ...expressions) {
//   const inspectOptions = { showHidden: false, colors: true, depth: null }// depth: null глубокий вывод. compact: true минимизация количества строк
//   let strOut = '';
//   function trim(str) { return str.split('\n').map((item) => item.trim()).join('\n') }//удаляем лишние пробелы для устранения эффекта форматирования шаблонных строк VSCode.
//   expressions.forEach((value, i) => {
//     if (i === expressions.length - 1) {
//       strOut += ' ' + trim(strings[i]) +
//         util.formatWithOptions(inspectOptions, value) + ' ' +
//         trim(strings[strings.length - 1]);
//     }// Добавляем последний строковой литерал
//     else strOut += ' ' + trim(strings[i]) + ' ' + util.formatWithOptions(inspectOptions, value);
//   })
//   // console.log(util.formatWithOptions({ showHidden: false, colors: true }, expressions[3]));// depth: null глубокий вывод
//   // console.log(util.inspect(expressions[3], { showHidden: false, colors: true }))// depth: null глубокий вывод объектов и цветом
//   console.log(strOut);
// }

function reinitGate(initialGate) {
  initialGate = {
    name: 'gate',
    globalFlag: false, // Глобальный ключ готовности программы для основного цикла работы
    messageObj: {},
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
    timeBay: undefined,
    timeSell: undefined,
    time: undefined,
  };
}

module.exports = { goTrade, testWritable, parseTest, changeTradeArr, timeStopTestClosure, consoleLogGroup, reinitGate, maxPercentCupClosure, timerClosure, funStartPingGate, funStartPingBith, funEndPing, funStartReconnect, coinConfigBith }
