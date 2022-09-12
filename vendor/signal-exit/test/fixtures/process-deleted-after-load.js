var onSignalExit = require('../../')

onSignalExit(function (code, signal) {
  throw new Error('this should not ever be called')
})

global.process = null
