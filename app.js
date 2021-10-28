const { wsGetGate, initialGate } = require('./lib/gate');
const { wsStartBith, initialBith, coinConfigBith } = require('./lib/bithumbpro');
const { testWritable } = require('./functions/functions');

function init() {
  let writableFiles = testWritable();
  coinConfigBith(initialBith).then(() => {
    console.log('then=');
    wsStartBith('subscribe', "ORDERBOOK10:XRP-USDT", initialGate, writableFiles);
    wsGetGate(Number(new Date().getTime()), 'spot.order_book', 'subscribe', ["XRP_USDT", "10", "100ms"], initialBith, writableFiles);
  })
    .catch((err) => {
      console.log('catch');
      console.log('err=', err);
      // init(); // можно рекурсивно перезапускать
    });
}

init();
