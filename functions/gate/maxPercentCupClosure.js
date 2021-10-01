const { consoleLogGroup } = require('../separate/consoleLogGroup');
// разница между нулевым элементом в ORDERBOOK и последним (9-тый индекс)
function maxPercentCupClosure() {
  let maxPercent = 0;
  function main(messageObj) {
    const length = messageObj.result.bids.length - 1;
    const bids0 = messageObj.result.bids[0][0];
    const bidsMaxLength = messageObj.result.bids[length][0];
    const percent = ((bids0 - bidsMaxLength) / bids0) * 100;
    if (percent > maxPercent) maxPercent = percent;
    consoleLogGroup`initialGate.messageObj.result.bids.length = ${messageObj.result.bids.length}
    initialGate.messageObj.result.bids[0][0] = ${messageObj.result.bids[0][0]}
    initialGate.messageObj.result.bids[length][0]) = ${messageObj.result.bids[length][0]}
    percent bids[0][0]-bids[length][0] = ${percent}
    maxPercent= ${maxPercent}`; //  за 5 минут получил 0.109 % maxPercent. За 8 дней 2.41%
  }
  return (messageObj) => main(messageObj)
}

module.exports = { maxPercentCupClosure }
