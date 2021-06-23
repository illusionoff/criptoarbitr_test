const fs = require("fs");

const { wsGetGate, initialGate } = require('./lib/gate');
const { wsStartBith, initialBith, coinConfigBith } = require('./lib/bithumbpro');
const { writtenCSV } = require('./functions/functions');

function init() {

  let writeableStream = fs.createWriteStream("logs/profit.csv", { flags: 'a' });

  let counts = {
    count: 0,
    countMessageAll: 0,
    countMessageStartNew: 0
  }

  // writeableStream.write('writeableStream');

  // if (writeableStream) console.log('writeableStream create:', writeableStream._writableState.finished); //writeableStream.WriteStream._writableState.WritableState.finished
  // writeableStream.end("завершение записи");
  // if (writeableStream) console.log('writeableStream Exist?:');
  // // console.log('writeableStream._writableState.finished:', writeableStream._writableState.finished); //writeableStream.WriteStream._writableState.WritableState.finished

  // console.log('writeableStream._writableState:', writeableStream._writableState); //writeableStream.WriteStream._writableState.WritableState.finished

  // writeableStream.on('finish', () => {
  //   // console.log('wrote all data to file');
  //   console.log('writeableStream._writableState.finished:', writeableStream._writableState.finished); //writeableStream.WriteStream._writableState.WritableState.finished
  // });
  // async () => console.log('writeableStream._writableState.finished2:', writeableStream._writableState.finished); //writeableStream.WriteStream._writableState.WritableState.finished
  // writeableStream.on("close", function () {
  //   console.log('writeableStream.close');
  // });
  // writeableStream.on("finish", function () {
  //   writeableStream.close(() => {
  //     console.log('writeableStream.close start');
  //     console.log('writeableStream.close=======writeableStream._writableState:', writeableStream._writableState);
  //     // writeableStream.write('writeableStream.write после close');
  //     // writeableStream = '';
  //   });
  //   console.log('writeableStream.on("finish":');
  // });
  // console.log('delete writeableStream====', delete writeableStream);


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
  coinConfigBith();
  wsStartBith('subscribe', "ORDERBOOK:XRP-USDT", initialGate);
  // wsGetGate(Math.round(Math.random() * 1000), 'depth.subscribe', ["XRP_USDT", 10, "0.0001"], initialBith, writeableStream, counts); // передаем данные для сравнения из bithumb
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
