const { consoleLogGroup } = require('./consoleLogGroup');
const config = require('config');


function goTrade(paramsGoTrade, writableFiles) {
  console.log('goTrade()----------------------------------------------------');
  const arrPrice = [paramsGoTrade.bayGate, paramsGoTrade.bayBith, paramsGoTrade.sellGate, paramsGoTrade.sellBith];
  // Если в данных есть ноль
  console.log(arrPrice)
  if (arrPrice.includes(0)) return
  // если данные устарели 1
  if (paramsGoTrade.timeServer - paramsGoTrade.timeBith > TIME_DEPRECAT || paramsGoTrade.timeServer - paramsGoTrade.timeGate > TIME_DEPRECAT) return
  // если данные устарели все 4 times
  //1629570661475
  // const arrTimesAll = [1629570640474, 1629570662475, 1629570663475, 1629570664475];
  // paramsGoTrade.timeServer = 1629570660475;
  const arrTimesAll = [paramsGoTrade.timeGateSell, paramsGoTrade.timeGateBay, paramsGoTrade.timeBithSell, paramsGoTrade.timeBithBay];
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
  let diffSell = paramsGoTrade.bayBith - paramsGoTrade.sellGate;
  let diffBay = paramsGoTrade.bayGate - paramsGoTrade.sellBith;

  let percentBonus = 0;
  if (diffSell > 0) {
    percentBonus = diffSell / paramsGoTrade.sellGate;
    console.log('Выгодно купить на Gate и продать на Bith = #1');
    console.log('percentBonus #1 =', percentBonus);
  }

  if (diffBay > 0) {
    percentBonus = diffBay / paramsGoTrade.sellBith;
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
  // if (diffSell > 0 || diffBay > 0) {
  console.log('diffSell=', diffSell);
  console.log('diffBay=', diffBay);
  console.log('paramsGoTrade.bayGate=', paramsGoTrade.bayGate);
  console.log('paramsGoTrade.sellGate=', paramsGoTrade.sellGate);
  consoleLogGroup`diffSell= ${diffSell}
  diffBay= ${diffBay}
  paramsGoTrade.bayGate= ${paramsGoTrade.bayGate}
  paramsGoTrade.sellGate= ${paramsGoTrade.sellGate}`;
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
};

module.exports = { goTrade }
