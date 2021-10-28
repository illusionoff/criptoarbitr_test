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
    timeServer: undefined,
    timeBay: undefined,
    timeSell: undefined,
    time: undefined,
  };
}

module.exports = { reinitGate }
