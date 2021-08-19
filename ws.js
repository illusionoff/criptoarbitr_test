// const fs = require("fs");
// test server
const { wsGetGate, initialGate } = require('./lib/gate');
const { wsStartBith, initialBith, coinConfigBith } = require('./lib/bithumbpro');//coinConfigBith
const { writtenCSV, testWritable, parseCSV, parseCSV2 } = require('./functions/functions');
// const { coinConfigBith } = require('./lib/bithOrderbook');

function init() {
  parseCSV();
  // process.exit();
  // setTimeout(() => { process.exit() }, 1000);
  // parseCSV();

  let writableFiles = testWritable();
  coinConfigBith().then(() => {
    console.log('then=');
    //// wsStartBith('subscribe', "TRADE:XRP-USDT", initialGate, counts, writeableStream); // была проблема с самим сервером Bithump, не отсылал сообщения 00007, поэтому делал альтернативный вариант
    wsStartBith('subscribe', "ORDERBOOK:XRP-USDT", initialGate, writableFiles);/////////////////////////
    wsGetGate(Number(new Date().getTime()), 'spot.order_book', 'subscribe', ["XRP_USDT", "10", "100ms"], initialBith, writableFiles); // передаем данные для /////////
  })
    .catch((err) => {
      console.log('catch');
      console.log('err=', err);
      // init(); // можно рекурсивно перезапускать
    });
}

init();
