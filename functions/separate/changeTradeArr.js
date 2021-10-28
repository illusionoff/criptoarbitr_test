function changeTradeArr(initialObj) {
  console.log('initialObj.name=', initialObj.name);
  let buy = initialObj.buy;
  let sell = initialObj.sell;
  let trueBay = false;
  let trueSell = false;
  let buyOrSell = -1;
  // initialObj.buyOrSell = -1; // для исключения влияния предыдущего значения опроса
  // проверка изменения значения для предотвращения лишних вычислений
  if (initialObj.orderbookFirstPreviousBay && buy != initialObj.orderbookFirstPreviousBay) {
    console.log('changeTradeArr() initialObj.orderbookFirstPreviousBay=', initialObj.orderbookFirstPreviousBay);
    console.log('changeTradeArr() initialObj.buy=', buy);
    buyOrSell = 1;
    initialObj.timeBay = new Date().getTime();
    initialObj.orderbookFirstPreviousBay = buy;
    console.log('buy=', buy);
    initialObj.priceAndComissionsBay = buy - buy * initialObj.takerComissions;//  buy=bids это покупатели, клиенты продают самая выгодня цена для клиентов самая высокая, комиссию отнимаем
    trueBay = true;
  }
  if (initialObj.orderbookFirstPreviousSell && sell != initialObj.orderbookFirstPreviousSell) {
    // Если одновременно изменения и в buy и в sell
    if (buyOrSell === 1) buyOrSell = 2
    else buyOrSell = 0;

    initialObj.timeSell = new Date().getTime();
    initialObj.orderbookFirstPreviousSell = sell;
    console.log('sell=', sell);
    initialObj.priceAndComissionsSell = sell + sell * initialObj.makerComissions; // sell=asks это продавцы, клиенты покупатели, самая выгодня цена для клиентов самая низкая, комиссию плюсуем
    trueSell = true;
  }

  if ((trueBay || trueSell) && (initialObj.priceAndComissionsSell && initialObj.priceAndComissionsBay)) {
    initialObj.buyOrSell = buyOrSell;
    return true
  }
  return false
}

module.exports = { changeTradeArr }
