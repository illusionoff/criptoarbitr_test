const { consoleLogGroup } = require('./consoleLogGroup');
const config = require('config');
const TIME_DEPRECAT = config.get('TIME_DEPRECAT');
const TIME_DEPRECAT_ALL = config.get('TIME_DEPRECAT_ALL');
const MIN_PROFIT = config.get('MIN_PROFIT');

function goTrade(paramsGoTrade, writableFiles) {
  console.log('goTrade()----------------------------------------------------');
  const arrPrice = [paramsGoTrade.buyGate, paramsGoTrade.buyBith, paramsGoTrade.sellGate, paramsGoTrade.sellBith];
  // Если в данных есть ноль
  console.log(arrPrice)
  if (arrPrice.includes(0)) return
  // если данные устарели 1
  if (paramsGoTrade.timeServer - paramsGoTrade.timeBith > TIME_DEPRECAT || paramsGoTrade.timeServer - paramsGoTrade.timeGate > TIME_DEPRECAT) return
  // если данные устарели все 4 times
  //1629570661475
  // const arrTimesAll = [1629570640474, 1629570662475, 1629570663475, 1629570664475];
  // paramsGoTrade.timeServer = 1629570660475;
  const arrTimesAll = [paramsGoTrade.timeGateSell, paramsGoTrade.timeGateBuy, paramsGoTrade.timeBithSell, paramsGoTrade.timeBithBuy];
  consoleLogGroup`Проверка 4 times
  arrTimesAll = ${arrTimesAll}
  arrPrice = ${arrPrice}
  paramsGoTrade.timeServer = ${paramsGoTrade.timeServer}
  paramsGoTrade.timeBith = ${paramsGoTrade.timeBith}
  paramsGoTrade.timeGate = ${paramsGoTrade.timeGate}`;
  const timeOutAll = arrTimesAll.some((item) => {
    if (paramsGoTrade.timeServer - item > TIME_DEPRECAT_ALL) return true
  });
  if (timeOutAll) return
  let diffSell = paramsGoTrade.buyBith - paramsGoTrade.sellGate;
  let diffBuy = paramsGoTrade.buyGate - paramsGoTrade.sellBith;

  let percentBonus = 0;
  if (diffSell > 0) {
    percentBonus = diffSell / paramsGoTrade.sellGate;
    console.log('Выгодно купить на Gate и продать на Bith = #1');
    console.log('percentBonus #1 =', percentBonus);
  }

  if (diffBuy > 0) {
    percentBonus = diffBuy / paramsGoTrade.sellBith;
    console.log('Выгодно продать на Gate и купить на Bith = #2');
    console.log('percentBonus #2=', percentBonus);
  }
  //округление
  Number.prototype.round = function (places) {
    return +(Math.round(this + "e+" + places) + "e-" + places);
  }
  //   var n = 1.7777;
  // n.round(2); // 1.78 .round(comma)
  const comma = 8;
  const commaPercent = 4;
  // if (diffSell > 0 || diffBuy > 0) {
  console.log('diffSell=', diffSell);
  console.log('diffBuy=', diffBuy);
  console.log('paramsGoTrade.buyGate=', paramsGoTrade.buyGate);
  console.log('paramsGoTrade.sellGate=', paramsGoTrade.sellGate);
  consoleLogGroup`diffSell= ${diffSell}
  diffBuy= ${diffBuy}
  paramsGoTrade.buyGate= ${paramsGoTrade.buyGate}
  paramsGoTrade.sellGate= ${paramsGoTrade.sellGate}`;
  if ((diffSell > MIN_PROFIT || diffBuy > MIN_PROFIT)) {
    const data = {
      buyGate: paramsGoTrade.buyGate.round(comma),
      buyBith: paramsGoTrade.buyBith.round(comma),
      sellGate: paramsGoTrade.sellGate.round(comma),
      sellBith: paramsGoTrade.sellBith.round(comma),
      diffSell: diffSell.round(comma),
      diffBuy: diffBuy.round(comma),
      timeServer: paramsGoTrade.timeServer,
      timeBith: paramsGoTrade.timeBith,
      timeGate: paramsGoTrade.timeGate,
      percentBonus: percentBonus.round(commaPercent),
      buyOrSellGate: paramsGoTrade.buyOrSellGate,
      buyOrSellBith: paramsGoTrade.buyOrSellBith,
      init: paramsGoTrade.init
    }
    console.log('data========================================', data);
    writableFiles(data);
  }
};

module.exports = { goTrade }
