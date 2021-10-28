const fetch = require('node-fetch');
const config = require('config');
const { consoleLogGroup } = require('../separate/consoleLogGroup');
const URL_BITH_COIN_CONFIG = config.get('URL_BITH_COIN_CONFIG');

async function coinConfigBith(initialBith) {
  try {
    console.log('coinConfigBith');
    const url = URL_BITH_COIN_CONFIG;
    let response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log("response.ok:", response.ok);
    if (!response.ok) {
      // throw new Error(responseSMS.status); // 404
      console.log('responseSMS.status', responseSMS.status);
      return
    }

    const data = await response.json();
    let coinConfig = data.data.coinConfig.find(coin => coin.name === config.get("CURRENCY_NAME"));
    console.log('coinConfigXRP:', coinConfig);
    console.log('response.status:', response.status);
    let spotConfigXRP = data.data.spotConfig.find(coin => coin.symbol === "XRP-USDT");
    console.log('data.data.spotConfig-XRP:', spotConfigXRP);
    // рассчитываем все комисии на taker - покупателя и maker - продавца
    initialBith.takerComissions = Number(data.data.contractConfig[0].takerFeeRate) + Number(data.data.coinConfig[0].takerFeeRate);
    console.log('data.data.coinConfig[0].takerFeeRate=', data.data.coinConfig[0].takerFeeRate)
    console.log('initialBith.takerComissions=', initialBith.takerComissions);
    initialBith.makerComissions = - (Number(data.data.contractConfig[0].makerFeeRate) - Number(data.data.coinConfig[0].makerFeeRate));
    consoleLogGroup`data.data.contractConfig[0].makerFeeRate = ${data.data.contractConfig[0].makerFeeRate}
    initialBith.makerComissions = ${initialBith.makerComissions}
    Number(data.data.coinConfig[0].makerFeeRate) = ${Number(data.data.coinConfig[0].makerFeeRate)}
    Number(data.data.contractConfig[0].makerFeeRate) = ${Number(data.data.contractConfig[0].makerFeeRate)}`
    initialBith.initialFetchURL = true;
  } catch (e) {
    initialBith.initialFetchURL = false;
    console.log('coinConfigBith error', e);
    coinConfigBith();
  }
}

module.exports = { coinConfigBith }
