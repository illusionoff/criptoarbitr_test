const assert = require('assert');
const parse = require('csv-parse');

const { coinConfigBith } = require('./bith/coinConfigBith');
const { changeTradeArr } = require('./separate/changeTradeArr');
const { consoleLogGroup } = require('./separate/consoleLogGroup');
const { timerClosure } = require('./separate/timerClosure');
const { funEndPing, funStartReconnect } = require('./separate/timeClosure/funsEndReconnect');
const { funStartPingBith } = require('./bith/funStartPingBith');
const { funStartPingGate } = require('./gate/funStartPingGate');
const { timeStopTestClosure } = require('./separate/timeStopTestClosure');
const { maxPercentCupClosure } = require('./gate/maxPercentCupClosure');
const { goTrade } = require('./separate/goTrade');
const { testWritable } = require('./separate/testWritable');
const { reinitGate } = require('./gate/reinitGate');

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

module.exports = { goTrade, testWritable, parseTest, changeTradeArr, timeStopTestClosure, consoleLogGroup, reinitGate, maxPercentCupClosure, timerClosure, funStartPingGate, funStartPingBith, funEndPing, funStartReconnect, coinConfigBith }
