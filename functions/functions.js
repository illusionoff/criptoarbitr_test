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

module.exports = { goTrade, testWritable, changeTradeArr, timeStopTestClosure, consoleLogGroup, reinitGate, maxPercentCupClosure, timerClosure, funStartPingGate, funStartPingBith, funEndPing, funStartReconnect, coinConfigBith }
