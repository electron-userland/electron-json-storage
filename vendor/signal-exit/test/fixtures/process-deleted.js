var onSignalExit = require('../../')
global.process = null

var unwrap = onSignalExit(function (code, signal) {
  throw new Error('this should not ever be called')
})

if (typeof unwrap !== 'function') {
  throw new Error('missing unwrap function')
}
