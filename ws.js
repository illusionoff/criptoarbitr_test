// const fs = require("fs");

const { wsGetGate, initialGate } = require('./lib/gate');
const { wsStartBith, initialBith, coinConfigBith } = require('./lib/bithumbpro');//coinConfigBith
const { writtenCSV, TestWritable, parseCSV } = require('./functions/functions');
// const { coinConfigBith } = require('./lib/bithOrderbook');

function init() {
  parseCSV();
  let writableFiles = TestWritable();
  // coinConfigBith().then((result) => {
  //   // console.log('result=', result);
  //   if (result) {
  //     //// wsStartBith('subscribe', "TRADE:XRP-USDT", initialGate, counts, writeableStream); // была проблема с самим сервером Bithump, не отсылал сообщения 00007, поэтому делал альтернативный вариант
  //     wsStartBith('subscribe', "ORDERBOOK:XRP-USDT", initialGate, writableFiles);/////////////////////////
  //     // wsGetGate(Number(new Date().getTime()), 'spot.order_book', 'subscribe', ["XRP_USDT", "10", "100ms"], initialBith, writableFiles); // передаем данные для /////////
  //   } else {
  //     init();
  //   }

  // });  
  coinConfigBith().then(() => {
    console.log('then=');
    //// wsStartBith('subscribe', "TRADE:XRP-USDT", initialGate, counts, writeableStream); // была проблема с самим сервером Bithump, не отсылал сообщения 00007, поэтому делал альтернативный вариант
    wsStartBith('subscribe', "ORDERBOOK:XRP-USDT", initialGate, writableFiles);/////////////////////////
    // wsGetGate(Number(new Date().getTime()), 'spot.order_book', 'subscribe', ["XRP_USDT", "10", "100ms"], initialBith, writableFiles); // передаем данные для /////////

  })
    .catch((err) => {
      console.log('catch');
      console.log('err=', err);
      init();
    });

}

init();
