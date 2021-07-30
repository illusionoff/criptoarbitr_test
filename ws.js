// const fs = require("fs");

const { wsGetGate, initialGate } = require('./lib/gate');
const { wsStartBith, initialBith } = require('./lib/bithumbpro');//coinConfigBith
const { writtenCSV, TestWritable, parseCSV, parseTest } = require('./functions/functions');
const { wsStartBithOrder10, coinConfigBith } = require('./lib/bithOrderbook10');

function init() {
  parseCSV();
  // parseTest();
  let counts = {
    count: 0,
    countMessageAll: 0,
    countMessageStartNew: 0
  }

  function fileNumber() {
    fs.readFile("logs/number.txt", "utf8",
      function (error, data) {
        if (error) throw error;
        let number = Number(data);
        console.log('File number=', number);
        // if (data == 'false') {
        //   data = 'true';
        // } else if (data == 'true') {
        //   data = 'false';
        // };
        number++;
        fs.writeFile("logs/number.txt", String(number), function (error) {
          if (error) throw error; // если возникла ошибка
          console.log("Асинхронная запись файла завершена");
        });
      }

    );
  };
  // fileNumber();

  // writtenCSV();

  // gate.wsGet(Math.round(Math.random() * 1000), 'server.ping', []);
  // gate.wsGet(Math.round(Math.random() * 1000), 'server.time', []);
  // gate.wsGet(Math.round(Math.random() * 1000), 'ticker.query', ["EOS_USDT", 86400]);
  // gate.wsGet(Math.round(Math.random() * 1000), 'ticker.subscribe', ["XRP_USDT"]);
  // gate.wsGet(Math.round(Math.random() * 1000), 'ticker.unsubscribe', []);

  // gate.wsGet(Math.round(Math.random()*1000),'trade.query', ["EOS_USDT", 2, 7177813]);

  // gate.wsGet(Math.round(Math.random() * 1000), 'trades.subscribe', ["XRP_USDT"]); //["ETH_USDT", "XRP_USDT"]

  //  gate.wsGet(Math.round(Math.random()*1000),'trades.unsubscribe', []);

  // gate.wsGet(Math.round(Math.random() * 1000), 'depth.query', ["XRP_USDT", 5, "0.0001"]);
  let writableFiles = TestWritable();
  // writableFiles('rrrr'); //работает ередача аргументов в замыкание!!!
  coinConfigBith();
  // wsStartBith('subscribe', "TRADE:XRP-USDT", initialGate, counts, writeableStream); // была проблема с самим сервером Bithump, не отсылал сообщения 00007, поэтому делал альтернативный вариант

  wsStartBith('subscribe', "ORDERBOOK:XRP-USDT", initialGate, writableFiles);/////////////////////////

  // wsStartBithOrder10('subscribe', "ORDERBOOK10:XRP-USDT", initialGate, writableFiles);///////////////////////////////
  // wsGetGate(Math.round(Math.random() * 1000), 'depth.subscribe', ["XRP_USDT", 10, "0.0001"], initialBith, writableFiles); // передаем данные для сравнения из bithumb

  // wsGetGate(Number(new Date().getTime()), 'spot.book_ticker', 'subscribe', ["XRP_USDT"], initialBith, writableFiles); // передаем данные для сравнения из bithumb//////////

  // wsGetGate(Number(new Date().getTime()), 'spot.order_book', 'subscribe', ["XRP_USDT", "10", "100ms"], initialBith, writableFiles); // передаем данные для /////////

  // gate.wsGet(Math.round(Math.random()*1000),'depth.unsubscribe', []);
  // gate.wsGet(Math.round(Math.random()*1000),'kline.query', ["BTC_USDT", 1, 1516951219, 1800]);
  // gate.wsGet(Math.round(Math.random()*1000),'kline.subscribe', ["BTC_USDT", 1800]);
  // gate.wsGet(Math.round(Math.random()*1000),'kline.unsubscribe', []);

  // gate.wsGet(Math.round(Math.random()*1000),'kline.update', [ 1492358400, "7000.00","8000.0","8100.00","6800.00", "1000.00","123456.00","BTC_USDT"]);

  //	gate.wsGet(Math.round(Math.random()*1000),'server.sign', []);
  //  gate.wsGet(Math.round(Math.random()*1000),'order.query', ["BTC_USDT", 0, 10]);
  //	gate.wsGet(Math.round(Math.random()*1000),'order.subscribe', ["BTC_USDT"]);
  //	gate.wsGet(Math.round(Math.random()*1000),'order.update', [2, "12345654654"]);
  //	gate.wsGet(Math.round(Math.random()*1000),'order.unsubscribe', []);
  //  gate.wsGet(Math.round(Math.random()*1000),'balance.query', ["BTC"]);
  //  gate.wsGet(Math.round(Math.random()*1000),'balance.subscribe', ["BTC"]);
  //	gate.wsGet(Math.round(Math.random()*1000),'balance.update', [{'EOS': {'available': '96.765323611874', 'freeze': '11'}}]);
  //	gate.wsGet(Math.round(Math.random()*1000),'balance.unsubscribe' ,[]);
}

// async function ping() {
//   await gate.wsGet(Math.round(Math.random() * 1000), 'server.ping', []);
// };
// ping();
init();
