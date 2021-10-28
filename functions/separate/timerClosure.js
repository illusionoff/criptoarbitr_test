/**
 *  start functions by timer and start functions when the timer is stopped
 *
 * @param {Object} options - Options for the nifty thing.
 * @param {number} options.period - `period` setInterval
 * @param {function} options.funStart - `funStart` function to start
 * @param {function} options.funEnd - `funEnd` function to end
 * @param {array} options.funStartArguments - `funStartArguments` arguments for the funStart function
 * @param {array} options.funEndArguments - `funEndArguments` arguments for the funEnd function
 * @param {number} options.warming - `warming` starting the function after the number of timer iterations
 * @returns {Object} - two functions `start` and `stop`
 */
let timerClosure = function ({
  period, // number
  // funStart = function () { console.log('null function funStart') },
  // funEnd = function () { console.log('null function funEnd') },
  funStart, // function
  funEnd,  // function
  funStartArguments = [],
  funEndArguments = [],
  warming = 0
}) {
  let id;
  let count = 0;// для разогрева - т.е не сразу начинать
  function start() {
    clearInterval(id);
    count++;
    if (count > warming) {
      id = setInterval(() => {
        // console.log('warming=', warming);
        if (funStart) funStart(...funStartArguments);
      }, period);
    }
  }

  function stop() {
    clearInterval(id);
    if (funEnd) funEnd(...funEndArguments);
    // funEnd(...funEndArguments);
  }

  return { start, stop }
};

module.exports = { timerClosure }
