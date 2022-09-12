/* global describe, it */

var exec = require('child_process').exec
var expect = require('chai').expect
var assert = require('assert')
var isWindows = process.platform === 'win32'
var shell = isWindows ? null : { shell: '/bin/bash' }
var node = isWindows ? '"' + process.execPath + '"' : process.execPath

require('chai').should()
require('tap').mochaGlobals()

describe('signal-exit', function () {
  it('receives an exit event when a process exits normally', function (done) {
    exec(node + ' ./test/fixtures/end-of-execution.js', shell, function (err, stdout, stderr) {
      expect(err).to.equal(null)
      stdout.should.match(/reached end of execution, 0, null/)
      done()
    })
  })

  it('receives an exit event when process.exit() is called', function (done) {
    exec(node + ' ./test/fixtures/exit.js', shell, function (err, stdout, stderr) {
      if (!isWindows) err.code.should.equal(32)
      stdout.should.match(/exited with process\.exit\(\), 32, null/)
      done()
    })
  })

  it('ensures that if alwaysLast=true, the handler is run last (signal)', function (done) {
    exec(node + ' ./test/fixtures/signal-last.js', shell, function (err, stdout, stderr) {
      assert(err)
      stdout.should.match(/first counter=1/)
      stdout.should.match(/last counter=2/)
      done()
    })
  })

  it('ensures that if alwaysLast=true, the handler is run last (normal exit)', function (done) {
    exec(node + ' ./test/fixtures/exit-last.js', shell, function (err, stdout, stderr) {
      assert.ifError(err)
      stdout.should.match(/first counter=1/)
      stdout.should.match(/last counter=2/)
      done()
    })
  })

  it('works when loaded multiple times', function (done) {
    exec(node + ' ./test/fixtures/multiple-load.js', shell, function (err, stdout, stderr) {
      assert(err)
      stdout.should.match(/first counter=1/)
      stdout.should.match(/first counter=2/)
      stdout.should.match(/last counter=3/)
      stdout.should.match(/last counter=4/)
      done()
    })
  })

  it('removes handlers when fully unwrapped', function (done) {
    exec(node + ' ./test/fixtures/unwrap.js', shell, function (err, stdout, stderr) {
      assert(err)
      if (!isWindows) err.signal.should.equal('SIGHUP')
      if (!isWindows) expect(err.code).to.equal(null)
      done()
    })
  })

  it('does not load() or unload() more than once', function (done) {
    exec(node + ' ./test/fixtures/load-unload.js', shell, function (err, stdout, stderr) {
      assert.ifError(err)
      done()
    })
  })

  if (!isWindows) {
    it('receives an exit event when a process is terminated with sigint', function (done) {
      exec(node + ' ./test/fixtures/sigint.js', shell, function (err, stdout, stderr) {
        assert(err)
        stdout.should.match(/exited with sigint, null, SIGINT/)
        done()
      })
    })

    it('receives an exit event when a process is terminated with sigterm', function (done) {
      exec(node + ' ./test/fixtures/sigterm.js', shell, function (err, stdout, stderr) {
        assert(err)
        stdout.should.match(/exited with sigterm, null, SIGTERM/)
        done()
      })
    })

    it('does not exit on sigpipe', function (done) {
      exec(node + ' ./test/fixtures/sigpipe.js', shell, function (err, stdout, stderr) {
        assert.ifError(err)
        stdout.should.match(/hello/)
        stderr.should.match(/onSignalExit\(0,null\)/)
        done()
      })
    })

    it('handles uncatchable signals with grace and poise', function (done) {
      exec(node + ' ./test/fixtures/sigkill.js', shell, function (err, stdout, stderr) {
        assert.ifError(err)
        done()
      })
    })

    it('does not exit if user handles signal', function (done) {
      exec(node + ' ./test/fixtures/signal-listener.js', shell, function (err, stdout, stderr) {
        assert(err)
        assert.equal(stdout, 'exited calledListener=4, code=null, signal="SIGHUP"\n')
        done()
      })
    })
  }
})
