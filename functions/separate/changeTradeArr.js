function changeTradeArr(initialObj) {
  console.log('initialObj.name=', initialObj.name);
  let bay = initialObj.bay;
  let sell = initialObj.sell;
  let trueBay = false;
  let trueSell = false;
  let bayOrSell = -1;
  // initialObj.bayOrSell = -1; // для исключения влияния предыдущего значения опроса
  // проверка изменения значения для предотвращения лишних вычислений
  if (initialObj.orderbookFirstPreviousBay && bay != initialObj.orderbookFirstPreviousBay) {
    console.log('changeTradeArr() initialObj.orderbookFirstPreviousBay=', initialObj.orderbookFirstPreviousBay);
    console.log('changeTradeArr() initialObj.bay=', bay);
    bayOrSell = 1;
    initialObj.timeBay = new Date().getTime();
    initialObj.orderbookFirstPreviousBay = bay;
    console.log('bay=', bay);
    initialObj.priceAndComissionsBay = bay - bay * initialObj.takerComissions;//  bay=bids это покупатели, клиенты продают самая выгодня цена для клиентов самая высокая, комиссию отнимаем
    trueBay = true;
  }
  if (initialObj.orderbookFirstPreviousSell && sell != initialObj.orderbookFirstPreviousSell) {
    // Если одновременно изменения и в bay и в sell
    if (bayOrSell === 1) bayOrSell = 2
    else bayOrSell = 0;

    initialObj.timeSell = new Date().getTime();
    initialObj.orderbookFirstPreviousSell = sell;
    console.log('sell=', sell);
    initialObj.priceAndComissionsSell = sell + sell * initialObj.makerComissions; // sell=asks это продавцы, клиенты покупатели, самая выгодня цена для клиентов самая низкая, комиссию плюсуем
    trueSell = true;
  }

  if ((trueBay || trueSell) && (initialObj.priceAndComissionsSell && initialObj.priceAndComissionsBay)) {
    initialObj.bayOrSell = bayOrSell;
    return true
  }
  return false
}

module.exports = { changeTradeArr }
