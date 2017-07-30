/*
 * The MIT License
 *
 * Copyright (c) 2016 Juan Cruz Viotti. https://github.com/jviotti
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

const electron = require('electron');
const m = require('mochainon');
const _ = require('lodash');
const async = require('async');
const fs = require('fs');
const path = require('path');
const tmp = require('tmp');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const storage = require('../lib/storage');
const utils = require('../lib/utils');
const app = electron.app || electron.remote.app;

describe('Electron JSON Storage', function() {

  this.timeout(20000);

  // Ensure each test case is always ran in a clean state
  beforeEach(storage.clear);

  describe('stress testing', function() {

    const cases = _.times(1000, () => {
      return Math.floor(Math.random() * 100000);
    });

    it('should survive serial stress testing', function(done) {
      async.eachSeries(cases, function(number, callback) {
        async.waterfall([
          _.partial(storage.set, 'foo', { value: number }),
          _.partial(storage.get, 'foo'),
          function(data, next) {
            m.chai.expect(data.value).to.equal(number);
            next();
          }
        ], callback);
      }, done);
    });

    it('should survive parallel stress testing', function(done) {
      async.eachSeries(cases, function(number, callback) {
        async.parallel([
          _.partial(storage.set, 'foo', { value: [number] }),
          _.partial(storage.set, 'foo', { value: [number, number] })
        ], function() {
          storage.get('foo', function(error, data) {
            m.chai.expect(error).to.not.exist;
            callback();
          });
        });
      }, done);
    });

  });

  describe('.get()', function() {

    it('should yield an error if no key', function(done) {
      storage.get(null, function(error, data) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Missing key');
        m.chai.expect(data).to.not.exist;
        done();
      });
    });

    it('should yield an error if key is not a string', function(done) {
      storage.get(123, function(error, data) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Invalid key');
        m.chai.expect(data).to.not.exist;
        done();
      });
    });

    it('should yield an error if key is a blank string', function(done) {
      storage.get('    ', function(error, data) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Invalid key');
        m.chai.expect(data).to.not.exist;
        done();
      });
    });

    describe('given the user data path does not exist', function() {

      beforeEach(function(done) {
        rimraf(utils.getUserDataPath(), done);
      });

      afterEach(function(done) {
        mkdirp(utils.getUserDataPath(), done);
      });

      it('should return an empty object for any key', function(done) {
        storage.get('foobarbaz', function(error, data) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(data).to.deep.equal({});
          done();
        });
      });

    });

    describe('given stored keys with a colon', function () {

      beforeEach(function(done) {
        async.parallel([
          _.partial(storage.set, 'foo', { name: 'foo' }),
          _.partial(storage.set, 'bar:colon', { name: 'bar' })
        ], done);
      });

      it('should return all stored keys', function (done) {
        storage.getAll(function(error, data) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(data).to.deep.equal({
            foo: { name: 'foo' },
            'bar:colon': { name: 'bar' }
          });
          done();
        });
      });

    });

    describe('given stored settings', function() {

      beforeEach(function(done) {
        storage.set('foo', { data: 'hello world' }, done);
      });

      it('should yield the data', function(done) {
        storage.get('foo', function(error, data) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(data).to.deep.equal({ data: 'hello world' });
          done();
        });
      });

      it('should yield the data if explicitly passing the extension', function(done) {
        storage.get('foo.json', function(error, data) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(data).to.deep.equal({ data: 'hello world' });
          done();
        });
      });

      it('should yield an empty object given an incorrect key', function(done) {
        storage.get('foobarbaz', function(error, data) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(data).to.deep.equal({});
          done();
        });
      });

    });

    describe('given invalid stored JSON', function() {

      beforeEach(function(done) {
        const fileName = utils.getFileName('foo');

        // Using fs directly since storage.set()
        // contains logic to prevent invalid JSON
        // from being written at all
        return fs.writeFile(fileName, 'Foo{bar}123', done);

      });

      it('should yield an error', function(done) {
        storage.get('foo', function(error, data) {
          m.chai.expect(error).to.be.an.instanceof(Error);
          m.chai.expect(error.message).to.equal('Invalid data: Foo{bar}123');
          m.chai.expect(data).to.not.exist;
          done();
        });
      });

    });

    describe('given a non-existent user data path', function() {

      beforeEach(function() {
        this.oldUserData = app.getPath('userData');
        app.setPath('userData', tmp.tmpNameSync());
      });

      afterEach(function() {
        app.setPath('userData', this.oldUserData);
      });

      it('should return an empty object for any key', function(done) {
        async.waterfall([
          function(callback) {
            storage.get('foo', callback);
          },
        ], function(error, result) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(result).to.deep.equal({});
          done();
        });
      });

    });

  });

  describe('.getMany()', function() {

    describe('given many stored keys', function() {

      beforeEach(function(done) {
        async.parallel([
          _.partial(storage.set, 'foo', { name: 'foo' }),
          _.partial(storage.set, 'bar', { name: 'bar' }),
          _.partial(storage.set, 'baz', { name: 'baz' })
        ], done);
      });

      it('should return an empty object if no passed keys', function(done) {
        storage.getMany([], function(error, data) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(data).to.deep.equal({});
          done();
        });
      });

      it('should read the passed keys', function(done) {
        storage.getMany([ 'foo', 'baz' ], function(error, data) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(data).to.deep.equal({
            foo: { name: 'foo' },
            baz: { name: 'baz' }
          });
          done();
        });
      });

      it('should be able to read a single key', function(done) {
        storage.getMany([ 'foo' ], function(error, data) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(data).to.deep.equal({
            foo: { name: 'foo' }
          });
          done();
        });
      });

      it('should return empty objects for missing keys', function(done) {
        storage.getMany([ 'foo', 'hello' ], function(error, data) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(data).to.deep.equal({
            foo: { name: 'foo' },
            hello: {}
          });
          done();
        });
      });

    });

  });

  describe('.getAll()', function() {

    describe('given the user data path does not exist', function() {

      beforeEach(function(done) {
        rimraf(utils.getUserDataPath(), done);
      });

      afterEach(function(done) {
        mkdirp(utils.getUserDataPath(), done);
      });

      it('should return an empty object', function(done) {
        storage.getAll(function(error, data) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(data).to.deep.equal({});
          done();
        });
      });

    });

    describe('given no stored keys', function() {

      beforeEach(storage.clear);

      it('should return an empty object', function(done) {
        storage.getAll(function(error, data) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(data).to.deep.equal({});
          done();
        });
      });

    });

    describe('given many stored keys', function() {

      beforeEach(function(done) {
        async.parallel([
          _.partial(storage.set, 'foo', { name: 'foo' }),
          _.partial(storage.set, 'bar', { name: 'bar' }),
          _.partial(storage.set, 'baz', { name: 'baz' })
        ], done);
      });

      it('should return all stored keys', function(done) {
        storage.getAll(function(error, data) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(data).to.deep.equal({
            foo: { name: 'foo' },
            bar: { name: 'bar' },
            baz: { name: 'baz' }
          });
          done();
        });
      });

    });

  });

  describe('.set()', function() {

    it('should yield an error if no key', function(done) {
      storage.set(null, { foo: 'bar' }, function(error) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Missing key');
        done();
      });
    });

    it('should yield an error if key is not a string', function(done) {
      storage.set(123, { foo: 'bar' }, function(error) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Invalid key');
        done();
      });
    });

    it('should yield an error if key is a blank string', function(done) {
      storage.set('    ', { foo: 'bar' }, function(error) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Invalid key');
        done();
      });
    });

    it('should yield an error if data is not a valid JSON object', function(done) {
      storage.set('foo', _.noop, function(error) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Invalid JSON data');
        done();
      });
    });

    it('should be able to store a valid JSON object in a file with a colon', function(done) {
      async.waterfall([
        function(callback) {
          storage.set('test:value', { foo: 'bar' }, callback);
        },
        function(callback) {
          storage.get('test:value', callback);
        }
      ], function(error, data) {
        m.chai.expect(error).to.not.exist;
        m.chai.expect(data).to.deep.equal({ foo: 'bar' });
        done();
      });
    });

    it('should be able to store a valid JSON object', function(done) {
      async.waterfall([
        function(callback) {
          storage.set('foo', { foo: 'baz' }, callback);
        },
        function(callback) {
          storage.get('foo', callback);
        }
      ], function(error, data) {
        m.chai.expect(error).to.not.exist;
        m.chai.expect(data).to.deep.equal({ foo: 'baz' });
        done();
      });
    });

    it('should ignore an explicit json extension', function(done) {
      async.waterfall([
        function(callback) {
          storage.set('foo.json', { foo: 'baz' }, callback);
        },
        function(callback) {
          storage.get('foo', callback);
        }
      ], function(error, data) {
        m.chai.expect(error).to.not.exist;
        m.chai.expect(data).to.deep.equal({ foo: 'baz' });
        done();
      });
    });

    it('should accept special characters as the key name', function(done) {
      const key = 'foo?bar:baz';
      async.waterfall([
        function(callback) {
          storage.set(key, { foo: 'baz' }, callback);
        },
        function(callback) {
          storage.get(key, callback);
        }
      ], function(error, data) {
        m.chai.expect(error).to.not.exist;
        m.chai.expect(data).to.deep.equal({ foo: 'baz' });
        done();
      });
    });

    describe('given an existing stored key', function() {

      beforeEach(function(done) {
        storage.set('foo', { foo: 'bar' }, done);
      });

      it('should be able to override the stored key', function(done) {
        async.waterfall([
          function(callback) {
            storage.get('foo', callback);
          },
          function(data, callback) {
            m.chai.expect(data).to.deep.equal({ foo: 'bar' });
            storage.set('foo', { foo: 'baz' }, callback);
          },
          function(callback) {
            storage.get('foo', callback);
          }
        ], function(error, data) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(data).to.deep.equal({ foo: 'baz' });
          done();
        });
      });

      it('should not override the stored key if the passed data is invalid', function(done) {
        storage.set('foo', _.noop, function(error) {
          m.chai.expect(error).to.be.an.instanceof(Error);

          storage.get('foo', function(error, data) {
            m.chai.expect(error).to.not.exist;
            m.chai.expect(data).to.deep.equal({ foo: 'bar' });
            done();
          });
        });
      });

    });

    describe('given a non-existent user data path', function() {

      beforeEach(function() {
        this.oldUserData = app.getPath('userData');
        app.setPath('userData', tmp.tmpNameSync());
      });

      afterEach(function() {
        app.setPath('userData', this.oldUserData);
      });

      it('should be able to set data', function(done) {
        async.waterfall([
          function(callback) {
            storage.set('foo', { foo: 'bar' }, callback);
          },
          function(callback) {
            storage.get('foo', callback);
          },
        ], function(error, result) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(result).to.deep.equal({ foo: 'bar' });
          done();
        });
      });

    });

  });

  describe('.has()', function() {

    it('should yield an error if no key', function(done) {
      storage.has(null, function(error, hasKey) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Missing key');
        m.chai.expect(hasKey).to.not.exist;
        done();
      });
    });

    it('should yield an error if key is not a string', function(done) {
      storage.has(123, function(error, hasKey) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Invalid key');
        m.chai.expect(hasKey).to.not.exist;
        done();
      });
    });

    it('should yield an error if key is a blank string', function(done) {
      storage.has('    ', function(error, hasKey) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Invalid key');
        m.chai.expect(hasKey).to.not.exist;
        done();
      });
    });

    describe('given a stored key', function() {

      beforeEach(function(done) {
        storage.set('foo', { foo: 'bar' }, done);
      });

      it('should yield true if the key exists', function(done) {
        storage.has('foo', function(error, hasKey) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(hasKey).to.equal(true);
          done();
        });
      });

      it('should yield true if the key has a json extension', function(done) {
        storage.has('foo.json', function(error, hasKey) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(hasKey).to.equal(true);
          done();
        });
      });

      it('should yield false if the key does not exist', function(done) {
        storage.has('hello', function(error, hasKey) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(hasKey).to.equal(false);
          done();
        });
      });

    });

  });

  describe('.keys()', function() {

    describe('given a file name with colons', function() {

      beforeEach(function(done) {
        async.waterfall([
          _.partial(storage.set, 'one', 'foo'),
          _.partial(storage.set, 'two', 'bar'),
          _.partial(storage.set, 'three:colon', 'baz')
        ], done);
      });

      afterEach(function(done) {
        rimraf(utils.getUserDataPath(), done);
      });

      it('should correctly decode the file names', function(done) {
        storage.keys(function(error, keys) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(keys).to.deep.equal([
            'one',
            'three:colon',
            'two'
          ]);

          done();
        });

      });

    });

    describe('given a .DS_Store file in the settings directory', function() {

      beforeEach(function(done) {
        async.waterfall([
          _.partial(storage.set, 'one', 'foo'),
          _.partial(storage.set, 'two', 'bar'),
          _.partial(storage.set, 'three', 'baz'),
          _.partial(fs.writeFile, path.join(utils.getUserDataPath(), '.DS_Store'), 'foo')
        ], done);
      });

      afterEach(function(done) {
        rimraf(utils.getUserDataPath(), done);
      });

      it('should onlt include the json files', function(done) {
        storage.keys(function(error, keys) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(keys.length).to.equal(3);
          m.chai.expect(_.includes(keys, 'one')).to.be.true;
          m.chai.expect(_.includes(keys, 'two')).to.be.true;
          m.chai.expect(_.includes(keys, 'three')).to.be.true;
          done();
        });
      });

    });

    it('should yield an empty array if no keys', function(done) {
      storage.keys(function(error, keys) {
        m.chai.expect(error).to.not.exist;
        m.chai.expect(keys).to.deep.equal([]);
        done();
      });
    });

    it('should yield a single key if there is one saved setting', function(done) {
      async.waterfall([
        function(callback) {
          storage.set('foo', 'bar', callback);
        },
        storage.keys,
      ], function(error, keys) {
        m.chai.expect(error).to.not.exist;
        m.chai.expect(keys).to.deep.equal([ 'foo' ]);
        done();
      });
    });

    it('should ignore the .json extension', function(done) {
      async.waterfall([
        function(callback) {
          storage.set('foo.json', 'bar', callback);
        },
        storage.keys,
      ], function(error, keys) {
        m.chai.expect(error).to.not.exist;
        m.chai.expect(keys).to.deep.equal([ 'foo' ]);
        done();
      });
    });

    it('should only remove the .json extension', function(done) {
      async.waterfall([
        function(callback) {
          storage.set('foo.data', 'bar', callback);
        },
        storage.keys,
      ], function(error, keys) {
        m.chai.expect(error).to.not.exist;
        m.chai.expect(keys).to.deep.equal([ 'foo.data' ]);
        done();
      });
    });

    it('should detect multiple saved settings', function(done) {
      async.waterfall([
        function(callback) {
          async.parallel([
            _.partial(storage.set, 'one', 'foo'),
            _.partial(storage.set, 'two', 'bar'),
            _.partial(storage.set, 'three', 'baz')
          ], callback);
        },
        function(result, callback) {
          storage.keys(callback);
        }
      ], function(error, keys) {
        m.chai.expect(error).to.not.exist;
        m.chai.expect(keys).to.deep.equal([
          'one',
          'three',
          'two'
        ]);
        done();
      });
    });

  });

  describe('.remove()', function() {

    it('should yield an error if no key', function(done) {
      storage.remove(null, function(error) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Missing key');
        done();
      });
    });

    it('should yield an error if key is not a string', function(done) {
      storage.remove(123, function(error) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Invalid key');
        done();
      });
    });

    it('should yield an error if key is a blank string', function(done) {
      storage.remove('     ', function(error) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Invalid key');
        done();
      });
    });

    describe('given a stored key', function() {

      beforeEach(function(done) {
        storage.set('foo', { foo: 'bar' }, done);
      });

      it('should be able to remove the key', function(done) {
        async.waterfall([
          function(callback) {
            storage.has('foo', callback);
          },
          function(hasKey, callback) {
            m.chai.expect(hasKey).to.be.true;
            storage.remove('foo', callback);
          },
          function(callback) {
            storage.has('foo', callback);
          }
        ], function(error, hasKey) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(hasKey).to.be.false;
          done();
        });
      });

      it('should do nothing if the key does not exist', function(done) {
        async.waterfall([
          function(callback) {
            storage.has('bar', callback);
          },
          function(hasKey, callback) {
            m.chai.expect(hasKey).to.be.false;
            storage.remove('bar', callback);
          },
          function(callback) {
            storage.has('bar', callback);
          }
        ], function(error, hasKey) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(hasKey).to.be.false;
          done();
        });
      });

    });

  });

  describe('.clear()', function() {

    it('should not yield an error if no keys', function(done) {
      storage.clear(function(error) {
        m.chai.expect(error).to.not.exist;
        done();
      });
    });

    describe('given a stored key', function() {

      beforeEach(function(done) {
        storage.set('foo', { foo: 'bar' }, done);
      });

      it('should clear the key', function(done) {
        async.waterfall([
          function(callback) {
            storage.has('foo', callback);
          },
          function(hasKey, callback) {
            m.chai.expect(hasKey).to.be.true;
            storage.clear(callback);
          },
          function(callback) {
            storage.has('foo', callback);
          }
        ], function(error, hasKey) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(hasKey).to.be.false;
          done();
        });
      });

      it('should not delete the user data storage directory', function(done) {
        const isDirectory = function(dir, callback) {
          fs.stat(dir, function(error, stat) {
            if (error) {
              if (error.code === 'ENOENT') {
                return callback(null, false);
              }

              return callback(error);
            }

            return callback(null, stat.isDirectory());
          });
        };

        const userDataPath = utils.getUserDataPath();

        async.waterfall([
          _.partial(isDirectory, userDataPath),
          function(directory, callback) {
            m.chai.expect(directory).to.be.true;
            storage.clear(callback);
          },
          _.partial(isDirectory, userDataPath)
        ], function(error, directory) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(directory).to.be.true;
          done();
        });
      });

      it('should not delete other files inside the user data directory', function(done) {
        const userDataPath = app.getPath('userData');

        async.waterfall([
          function(callback) {
            async.parallel([
              _.partial(fs.writeFile, path.join(userDataPath, 'foo'), 'foo'),
              _.partial(fs.writeFile, path.join(userDataPath, 'bar'), 'bar.json')
            ], callback);
          },
          function(results, callback) {
            storage.clear(callback);
          },
          function(callback) {
            async.parallel([
              _.partial(fs.readFile, path.join(userDataPath, 'foo'), { encoding: 'utf8' }),
              _.partial(fs.readFile, path.join(userDataPath, 'bar'), { encoding: 'utf8' })
            ], callback);
          }
        ], function(error, results) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(results).to.deep.equal([ 'foo', 'bar.json' ]);
          done();
        });
      });

    });

    describe('given many stored keys', function() {

      beforeEach(function(done) {
        async.parallel([
          _.partial(storage.set, 'foo', { name: 'foo' }),
          _.partial(storage.set, 'bar', { name: 'bar' }),
          _.partial(storage.set, 'baz', { name: 'baz' })
        ], done);
      });

      it('should clear all stored keys', function(done) {
        async.waterfall([
          function(callback) {
            async.parallel({
              foo: _.partial(storage.has, 'foo'),
              bar: _.partial(storage.has, 'bar'),
              baz: _.partial(storage.has, 'baz')
            }, callback);
          },
          function(results, callback) {
            m.chai.expect(results.foo).to.be.true;
            m.chai.expect(results.bar).to.be.true;
            m.chai.expect(results.baz).to.be.true;

            storage.clear(callback);
          },
          function(callback) {
            async.parallel({
              foo: _.partial(storage.has, 'foo'),
              bar: _.partial(storage.has, 'bar'),
              baz: _.partial(storage.has, 'baz')
            }, callback);
          },
        ], function(error, results) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(results.foo).to.be.false;
          m.chai.expect(results.bar).to.be.false;
          m.chai.expect(results.baz).to.be.false;
          done();
        });
      });

    });

  });

});
