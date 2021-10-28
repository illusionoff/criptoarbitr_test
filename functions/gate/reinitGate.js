function reinitGate(initialGate) {
  initialGate = {
    name: 'gate',
    globalFlag: false, // Глобальный ключ готовности программы для основного цикла работы
    messageObj: {},
    takerComissions: 0.002,
    makerComissions: 0.002,
    speedComissions: 0.002,
    priceAndComissionsBuy: 0,
    priceAndComissionsSell: 0,
    buy: 0,
    sell: 0,
    ver: 0,
    orderbookFirstPreviousBuy: undefined,
    orderbookFirstPreviousSell: undefined,
    buyOrSell: -1,
    timeServer: undefined,
    timeBuy: undefined,
    timeSell: undefined,
    time: undefined,
  };
}

module.exports = { reinitGate }
