// const fs = require("fs");

const { wsGetGate, initialGate } = require('./lib/gate');
const { wsStartBith, initialBith } = require('./lib/bithumbpro');//coinConfigBith
const { writtenCSV, TestWritable, parseCSV } = require('./functions/functions');
const { wsStartBithOder10, coinConfigBith } = require('./lib/bithOrderbook10');

function init() {
  parseCSV();
  let writableFiles = TestWritable();
  coinConfigBith();
  //// wsStartBith('subscribe', "TRADE:XRP-USDT", initialGate, counts, writeableStream); // была проблема с самим сервером Bithump, не отсылал сообщения 00007, поэтому делал альтернативный вариант
  wsStartBith('subscribe', "ORDERBOOK:XRP-USDT", initialGate, writableFiles);/////////////////////////
  wsGetGate(Number(new Date().getTime()), 'spot.order_book', 'subscribe', ["XRP_USDT", "10", "100ms"], initialBith, writableFiles); // передаем данные для /////////
}
init();
