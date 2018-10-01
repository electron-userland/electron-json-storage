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
const _ = require('lodash');
const async = require('async');
const fs = require('fs');
const path = require('path');
const os = require('os');
const tmp = require('tmp');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const chai = require('chai');
const storage = require('../lib/storage');
const utils = require('../lib/utils');
const app = electron.app || electron.remote.app;

describe('Electron JSON Storage', function() {

  this.timeout(100000);

  // Ensure each test case is always ran in a clean state
  beforeEach(function(done) {
    storage.setDataPath(utils.getDefaultDataPath());
    storage.clear(done);
  });

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
            chai.expect(data.value).to.equal(number);
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
            chai.expect(error).to.not.exist;
            callback();
          });
        });
      }, done);
    });

  });

  describe('.getDefaultDataPath()', function() {

    it('should be a string', function() {
      chai.expect(_.isString(storage.getDefaultDataPath())).to.be.true;
    });

    it('should be an absolute path', function() {
      chai.expect(path.isAbsolute(storage.getDefaultDataPath())).to.be.true;
    });

  });

  describe('.setDataPath()', function() {

    it('should be able to set a custom data path', function() {
      const newDataPath = os.tmpdir();
      storage.setDataPath(newDataPath);
      const dataPath = storage.getDataPath();
      chai.expect(dataPath).to.equal(newDataPath);
    });

    it('should set the default path if no argument', function() {
      storage.setDataPath();
      const dataPath = app.getPath('userData');
      chai.expect(storage.getDataPath().indexOf(dataPath)).to.equal(0);
    });

    it('should throw given a relative path', function() {
      chai.expect(function() {
        storage.setDataPath('foo');
      }).to.throw('The user data path should be an absolute directory');
    });

  });

  describe('.getDataPath()', function() {

    it('should initially return the default data path', function() {
      const dataPath = storage.getDataPath();
      chai.expect(dataPath).to.equal(utils.getDefaultDataPath());
    });

    it('should be able to return new data paths', function() {
      const newDataPath = os.tmpdir();
      storage.setDataPath(newDataPath);
      const dataPath = storage.getDataPath();
      chai.expect(dataPath).to.equal(newDataPath);
    });

  });

  describe('.get()', function() {

    it('should yield an error if no key', function(done) {
      storage.get(null, function(error, data) {
        chai.expect(error).to.be.an.instanceof(Error);
        chai.expect(error.message).to.equal('Missing key');
        chai.expect(data).to.not.exist;
        done();
      });
    });

    it('should yield an error if key is not a string', function(done) {
      storage.get(123, function(error, data) {
        chai.expect(error).to.be.an.instanceof(Error);
        chai.expect(error.message).to.equal('Invalid key');
        chai.expect(data).to.not.exist;
        done();
      });
    });

    it('should yield an error if key is a blank string', function(done) {
      storage.get('    ', function(error, data) {
        chai.expect(error).to.be.an.instanceof(Error);
        chai.expect(error.message).to.equal('Invalid key');
        chai.expect(data).to.not.exist;
        done();
      });
    });

    describe('given the user data path does not exist', function() {

      beforeEach(function(done) {
        rimraf(storage.getDataPath(), done);
      });

      afterEach(function(done) {
        mkdirp(storage.getDataPath(), done);
      });

      it('should return an empty object for any key', function(done) {
        storage.get('foobarbaz', function(error, data) {
          chai.expect(error).to.not.exist;
          chai.expect(data).to.deep.equal({});
          done();
        });
      });

    });

    describe('given the same key stored in multiple data paths', function(done) {

      beforeEach(function(done) {
        this.newDataPath = path.join(os.tmpdir(), 'electron-json-storage');
        const self = this;

        async.waterfall([
          function(callback) {
            storage.setDataPath(self.newDataPath);
            callback();
          },
          function(callback) {
            storage.set('foo', { location: 'new' }, callback);
          },
          function(callback) {
            storage.setDataPath(utils.getDefaultDataPath());
            callback();
          },
          function(callback) {
            storage.set('foo', { location: 'default' }, callback);
          }
        ], done);
      });

      it('should initially return the key in the default location', function(done) {
        storage.get('foo', function(error, data) {
          chai.expect(error).to.not.exist;
          chai.expect(data).to.deep.equal({
            location: 'default'
          });

          done();
        });
      });

      it('should return the new value given the right data path', function(done) {
        storage.setDataPath(this.newDataPath);
        storage.get('foo', function(error, data) {
          chai.expect(error).to.not.exist;
          chai.expect(data).to.deep.equal({
            location: 'new'
          });

          done();
        });
      });

      it('should return nothing given the wrong data path', function(done) {
        if (os.platform() === 'win32') {
          storage.setDataPath('C:\\tmp\\electron-json-storage');
        } else {
          storage.setDataPath('/tmp/electron-json-storage');
        }

        async.waterfall([
          storage.clear,
          function(callback) {
            storage.get('foo', callback);
          }
        ], function(error, data) {
          chai.expect(error).to.not.exist;
          chai.expect(data).to.deep.equal({});
          done();
        });
      });
    });

    describe('given stored keys with a colon', function() {

      beforeEach(function(done) {
        async.parallel([
          _.partial(storage.set, 'foo', { name: 'foo' }),
          _.partial(storage.set, 'bar:colon', { name: 'bar' })
        ], done);
      });

      it('should return all stored keys', function(done) {
        storage.getAll(function(error, data) {
          chai.expect(error).to.not.exist;
          chai.expect(data).to.deep.equal({
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
          chai.expect(error).to.not.exist;
          chai.expect(data).to.deep.equal({ data: 'hello world' });
          done();
        });
      });

      it('should yield the data if explicitly passing the extension', function(done) {
        storage.get('foo.json', function(error, data) {
          chai.expect(error).to.not.exist;
          chai.expect(data).to.deep.equal({ data: 'hello world' });
          done();
        });
      });

      it('should yield an empty object given an incorrect key', function(done) {
        storage.get('foobarbaz', function(error, data) {
          chai.expect(error).to.not.exist;
          chai.expect(data).to.deep.equal({});
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
          chai.expect(error).to.be.an.instanceof(Error);
          chai.expect(error.message).to.equal('Invalid data: Foo{bar}123');
          chai.expect(data).to.not.exist;
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
          chai.expect(error).to.not.exist;
          chai.expect(result).to.deep.equal({});
          done();
        });
      });

    });

  });

  describe('.getMany()', function() {

    describe('given many stored keys in a custom data path', function() {

      beforeEach(function(done) {
        this.dataPath = os.tmpdir();
        async.parallel([
          _.partial(storage.set, 'foo', { name: 'foo' }, { dataPath: this.dataPath }),
          _.partial(storage.set, 'bar', { name: 'bar' }, { dataPath: this.dataPath }),
          _.partial(storage.set, 'baz', { name: 'baz' }, { dataPath: this.dataPath })
        ], done);
      });

      it('should return nothing given the wrong data path', function(done) {
        storage.getMany([ 'foo', 'baz' ], function(error, data) {
          chai.expect(error).to.not.exist;
          chai.expect(data).to.deep.equal({
            foo: {},
            baz: {}
          });
          done();
        });
      });

      it('should return the values given the correct data path', function(done) {
        storage.getMany([ 'foo', 'baz' ], {
          dataPath: this.dataPath
        }, function(error, data) {
          chai.expect(error).to.not.exist;
          chai.expect(data).to.deep.equal({
            foo: { name: 'foo' },
            baz: { name: 'baz' }
          });
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

      it('should return an empty object if no passed keys', function(done) {
        storage.getMany([], function(error, data) {
          chai.expect(error).to.not.exist;
          chai.expect(data).to.deep.equal({});
          done();
        });
      });

      it('should read the passed keys', function(done) {
        storage.getMany([ 'foo', 'baz' ], function(error, data) {
          chai.expect(error).to.not.exist;
          chai.expect(data).to.deep.equal({
            foo: { name: 'foo' },
            baz: { name: 'baz' }
          });
          done();
        });
      });

      it('should be able to read a single key', function(done) {
        storage.getMany([ 'foo' ], function(error, data) {
          chai.expect(error).to.not.exist;
          chai.expect(data).to.deep.equal({
            foo: { name: 'foo' }
          });
          done();
        });
      });

      it('should return empty objects for missing keys', function(done) {
        storage.getMany([ 'foo', 'hello' ], function(error, data) {
          chai.expect(error).to.not.exist;
          chai.expect(data).to.deep.equal({
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
        rimraf(storage.getDataPath(), done);
      });

      afterEach(function(done) {
        mkdirp(storage.getDataPath(), done);
      });

      it('should return an empty object', function(done) {
        storage.getAll(function(error, data) {
          chai.expect(error).to.not.exist;
          chai.expect(data).to.deep.equal({});
          done();
        });
      });

    });

    describe('given no stored keys', function() {

      beforeEach(storage.clear);

      it('should return an empty object', function(done) {
        storage.getAll(function(error, data) {
          chai.expect(error).to.not.exist;
          chai.expect(data).to.deep.equal({});
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
          chai.expect(error).to.not.exist;
          chai.expect(data).to.deep.equal({
            foo: { name: 'foo' },
            bar: { name: 'bar' },
            baz: { name: 'baz' }
          });
          done();
        });
      });

    });

    describe('given many stored keys in different locations', function() {

      beforeEach(function(done) {
        this.dataPath = path.join(os.tmpdir(), 'hello');

        async.parallel([
          _.partial(storage.set, 'foo', { name: 'foo' }),
          _.partial(storage.set, 'bar', { name: 'bar' }, {
            dataPath: this.dataPath
          }),
          _.partial(storage.set, 'baz', { name: 'baz' })
        ], done);
      });

      it('should return all stored keys in the default location', function(done) {
        storage.getAll(function(error, data) {
          chai.expect(error).to.not.exist;
          chai.expect(data).to.deep.equal({
            foo: { name: 'foo' },
            baz: { name: 'baz' }
          });
          done();
        });
      });

      it('should return all stored keys in a custom location', function(done) {
        storage.getAll({
          dataPath: this.dataPath
        }, function(error, data) {
          chai.expect(error).to.not.exist;
          chai.expect(data).to.deep.equal({
            bar: { name: 'bar' }
          });
          done();
        });
      });

    });

    describe('given many stored keys in different data directories', function() {

      beforeEach(function(done) {
        this.newDataPath = path.join(os.tmpdir(), 'electron-json-storage');
        const self = this;

        async.parallel([
          function(callback) {
            storage.setDataPath(self.newDataPath);
            callback();
          },
          function(callback) {
            storage.set('foo', { name: 'foo' }, callback);
          },
          function(callback) {
            storage.set('bar', { name: 'bar' }, callback);
          },
          function(callback) {
            storage.setDataPath(utils.getDefaultDataPath());
            callback();
          },
          function(callback) {
            storage.set('baz', { name: 'baz' }, callback);
          }
        ], done);
      });

      it('should return all stored keys depending on the data path', function(done) {
        storage.setDataPath(this.newDataPath);

        async.waterfall([
          storage.getAll,
          function(keys, callback) {
            chai.expect(keys).to.deep.equal({
              foo: { name: 'foo' },
              bar: { name: 'bar' }
            });

            callback();
          },
          function(callback) {
            storage.setDataPath(utils.getDefaultDataPath());
            callback();
          },
          storage.getAll,
          function(keys, callback) {
            chai.expect(keys).to.deep.equal({
              baz: { name: 'baz' }
            });

            callback();
          },
        ], done);
      });

    });

  });

  describe('.set()', function() {

    it('should yield an error if no key', function(done) {
      storage.set(null, { foo: 'bar' }, function(error) {
        chai.expect(error).to.be.an.instanceof(Error);
        chai.expect(error.message).to.equal('Missing key');
        done();
      });
    });

    it('should yield an error if key is not a string', function(done) {
      storage.set(123, { foo: 'bar' }, function(error) {
        chai.expect(error).to.be.an.instanceof(Error);
        chai.expect(error.message).to.equal('Invalid key');
        done();
      });
    });

    it('should yield an error if key is a blank string', function(done) {
      storage.set('    ', { foo: 'bar' }, function(error) {
        chai.expect(error).to.be.an.instanceof(Error);
        chai.expect(error.message).to.equal('Invalid key');
        done();
      });
    });

    it('should yield an error if data is not a valid JSON object', function(done) {
      storage.set('foo', _.noop, function(error) {
        chai.expect(error).to.be.an.instanceof(Error);
        chai.expect(error.message).to.equal('Invalid JSON data');
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
        chai.expect(error).to.not.exist;
        chai.expect(data).to.deep.equal({ foo: 'bar' });
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
        chai.expect(error).to.not.exist;
        chai.expect(data).to.deep.equal({ foo: 'baz' });
        done();
      });
    });

    it('should be able to store an object to a custom location', function(done) {
      const newDataPath = os.tmpdir();

      async.waterfall([
        function(callback) {
          storage.set('foo', { foo: 'baz' }, {
            dataPath: newDataPath
          }, callback);
        },
        function(callback) {
          async.parallel({
            newDataPath: function(callback) {
              storage.get('foo', {
                dataPath: newDataPath
              }, callback);
            },
            oldDataPath: function(callback) {
              storage.get('foo', callback);
            }
          }, callback);
        }
      ], function(error, results) {
        chai.expect(error).to.not.exist;
        chai.expect(results.newDataPath).to.deep.equal({ foo: 'baz' });
        chai.expect(results.oldDataPath).to.deep.equal({});
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
        chai.expect(error).to.not.exist;
        chai.expect(data).to.deep.equal({ foo: 'baz' });
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
        chai.expect(error).to.not.exist;
        chai.expect(data).to.deep.equal({ foo: 'baz' });
        done();
      });
    });

    it('should accept spaces in the key name', function(done){
        const key = 'foo bar baz';
        async.waterfall([
          function(callback) {
            storage.set(key, { foo: 'baz' }, callback);
          },
          function(callback) {
            storage.get(key, callback);
          }
        ], function(error, data) {
          chai.expect(error).to.not.exist;
          chai.expect(data).to.deep.equal({ foo: 'baz' });
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
            chai.expect(data).to.deep.equal({ foo: 'bar' });
            storage.set('foo', { foo: 'baz' }, callback);
          },
          function(callback) {
            storage.get('foo', callback);
          }
        ], function(error, data) {
          chai.expect(error).to.not.exist;
          chai.expect(data).to.deep.equal({ foo: 'baz' });
          done();
        });
      });

      it('should not override the stored key if the passed data is invalid', function(done) {
        storage.set('foo', _.noop, function(error) {
          chai.expect(error).to.be.an.instanceof(Error);

          storage.get('foo', function(error, data) {
            chai.expect(error).to.not.exist;
            chai.expect(data).to.deep.equal({ foo: 'bar' });
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
          chai.expect(error).to.not.exist;
          chai.expect(result).to.deep.equal({ foo: 'bar' });
          done();
        });
      });

    });

  });

  describe('.has()', function() {

    it('should yield an error if no key', function(done) {
      storage.has(null, function(error, hasKey) {
        chai.expect(error).to.be.an.instanceof(Error);
        chai.expect(error.message).to.equal('Missing key');
        chai.expect(hasKey).to.not.exist;
        done();
      });
    });

    it('should yield an error if key is not a string', function(done) {
      storage.has(123, function(error, hasKey) {
        chai.expect(error).to.be.an.instanceof(Error);
        chai.expect(error.message).to.equal('Invalid key');
        chai.expect(hasKey).to.not.exist;
        done();
      });
    });

    it('should yield an error if key is a blank string', function(done) {
      storage.has('    ', function(error, hasKey) {
        chai.expect(error).to.be.an.instanceof(Error);
        chai.expect(error.message).to.equal('Invalid key');
        chai.expect(hasKey).to.not.exist;
        done();
      });
    });

    describe('given a stored key in a custom location', function() {

      beforeEach(function(done) {
        this.dataPath = os.tmpdir();
        storage.set('foo', { foo: 'bar' }, {
          dataPath: this.dataPath
        }, done);
      });

      it('should yield false given the default data path', function(done) {
        storage.has('foo', function(error, hasKey) {
          chai.expect(error).to.not.exist;
          chai.expect(hasKey).to.equal(false);
          done();
        });
      });

      it('should yield true given the custom data path', function(done) {
        storage.has('foo', {
          dataPath: this.dataPath
        }, function(error, hasKey) {
          chai.expect(error).to.not.exist;
          chai.expect(hasKey).to.equal(true);
          done();
        });
      });

    });

    describe('given a stored key', function() {

      beforeEach(function(done) {
        storage.set('foo', { foo: 'bar' }, done);
      });

      it('should yield true if the key exists', function(done) {
        storage.has('foo', function(error, hasKey) {
          chai.expect(error).to.not.exist;
          chai.expect(hasKey).to.equal(true);
          done();
        });
      });

      it('should yield true if the key has a json extension', function(done) {
        storage.has('foo.json', function(error, hasKey) {
          chai.expect(error).to.not.exist;
          chai.expect(hasKey).to.equal(true);
          done();
        });
      });

      it('should yield false if the key does not exist', function(done) {
        storage.has('hello', function(error, hasKey) {
          chai.expect(error).to.not.exist;
          chai.expect(hasKey).to.equal(false);
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
        rimraf(storage.getDataPath(), done);
      });

      it('should correctly decode the file names', function(done) {
        storage.keys(function(error, keys) {
          chai.expect(error).to.not.exist;
          chai.expect(keys).to.deep.equal([
            'one',
            'three:colon',
            'two'
          ]);

          done();
        });

      });

    });

    describe('given keys in a custom location', function() {

      beforeEach(function(done) {
        this.dataPath = path.join(os.tmpdir(), 'custom-data-path');
        async.waterfall([
          _.partial(storage.set, 'one', 'foo', { dataPath: this.dataPath }),
          _.partial(storage.set, 'two', 'bar', { dataPath: this.dataPath }),
          _.partial(storage.set, 'three', 'baz', { dataPath: this.dataPath })
        ], done);
      });

      it('should return nothing given the default data path', function(done) {
        storage.keys(function(error, keys) {
          chai.expect(error).to.not.exist;
          chai.expect(keys.length).to.equal(0);
          done();
        });
      });

      it('should return the keys given the custom location', function(done) {
        storage.keys({
          dataPath: this.dataPath
        }, function(error, keys) {
          chai.expect(error).to.not.exist;
          chai.expect(keys.length).to.equal(3);
          chai.expect(_.includes(keys, 'one')).to.be.true;
          chai.expect(_.includes(keys, 'two')).to.be.true;
          chai.expect(_.includes(keys, 'three')).to.be.true;
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
          _.partial(fs.writeFile, path.join(storage.getDataPath(), '.DS_Store'), 'foo')
        ], done);
      });

      afterEach(function(done) {
        rimraf(storage.getDataPath(), done);
      });

      it('should only include the json files', function(done) {
        storage.keys(function(error, keys) {
          chai.expect(error).to.not.exist;
          chai.expect(keys.length).to.equal(3);
          chai.expect(_.includes(keys, 'one')).to.be.true;
          chai.expect(_.includes(keys, 'two')).to.be.true;
          chai.expect(_.includes(keys, 'three')).to.be.true;
          done();
        });
      });

    });

    it('should yield an empty array if no keys', function(done) {
      storage.keys(function(error, keys) {
        chai.expect(error).to.not.exist;
        chai.expect(keys).to.deep.equal([]);
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
        chai.expect(error).to.not.exist;
        chai.expect(keys).to.deep.equal([ 'foo' ]);
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
        chai.expect(error).to.not.exist;
        chai.expect(keys).to.deep.equal([ 'foo' ]);
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
        chai.expect(error).to.not.exist;
        chai.expect(keys).to.deep.equal([ 'foo.data' ]);
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
        chai.expect(error).to.not.exist;
        chai.expect(keys).to.deep.equal([
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
        chai.expect(error).to.be.an.instanceof(Error);
        chai.expect(error.message).to.equal('Missing key');
        done();
      });
    });

    it('should yield an error if key is not a string', function(done) {
      storage.remove(123, function(error) {
        chai.expect(error).to.be.an.instanceof(Error);
        chai.expect(error.message).to.equal('Invalid key');
        done();
      });
    });

    it('should yield an error if key is a blank string', function(done) {
      storage.remove('     ', function(error) {
        chai.expect(error).to.be.an.instanceof(Error);
        chai.expect(error.message).to.equal('Invalid key');
        done();
      });
    });

    describe('given a stored key in a custom location', function() {

      beforeEach(function(done) {
        this.dataPath = os.tmpdir();
        storage.set('foo', { foo: 'bar' }, { dataPath: this.dataPath }, done);
      });

      it('should be able to remove the key', function(done) {
        var options = {
          dataPath: this.dataPath
        };

        async.waterfall([
          function(callback) {
            storage.has('foo', options, callback);
          },
          function(hasKey, callback) {
            chai.expect(hasKey).to.be.true;
            storage.remove('foo', options, callback);
          },
          function(callback) {
            storage.has('foo', options, callback);
          }
        ], function(error, hasKey) {
          chai.expect(error).to.not.exist;
          chai.expect(hasKey).to.be.false;
          done();
        });
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
            chai.expect(hasKey).to.be.true;
            storage.remove('foo', callback);
          },
          function(callback) {
            storage.has('foo', callback);
          }
        ], function(error, hasKey) {
          chai.expect(error).to.not.exist;
          chai.expect(hasKey).to.be.false;
          done();
        });
      });

      it('should do nothing if the key does not exist', function(done) {
        async.waterfall([
          function(callback) {
            storage.has('bar', callback);
          },
          function(hasKey, callback) {
            chai.expect(hasKey).to.be.false;
            storage.remove('bar', callback);
          },
          function(callback) {
            storage.has('bar', callback);
          }
        ], function(error, hasKey) {
          chai.expect(error).to.not.exist;
          chai.expect(hasKey).to.be.false;
          done();
        });
      });

    });

  });

  describe('.clear()', function() {

    it('should not yield an error if no keys', function(done) {
      storage.clear(function(error) {
        chai.expect(error).to.not.exist;
        done();
      });
    });

    describe('given a stored key in a custom location', function() {

      beforeEach(function(done) {
        this.dataPath = os.tmpdir();
        storage.set('foo', { foo: 'bar' }, { dataPath: this.dataPath }, done);
      });

      it('should clear the key', function(done) {
        var options = {
          dataPath: this.dataPath
        };

        async.waterfall([
          function(callback) {
            storage.has('foo', options, callback);
          },
          function(hasKey, callback) {
            chai.expect(hasKey).to.be.true;
            storage.clear(options, callback);
          },
          function(callback) {
            storage.has('foo', options, callback);
          }
        ], function(error, hasKey) {
          chai.expect(error).to.not.exist;
          chai.expect(hasKey).to.be.false;
          done();
        });
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
            chai.expect(hasKey).to.be.true;
            storage.clear(callback);
          },
          function(callback) {
            storage.has('foo', callback);
          }
        ], function(error, hasKey) {
          chai.expect(error).to.not.exist;
          chai.expect(hasKey).to.be.false;
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

        const userDataPath = storage.getDataPath();

        async.waterfall([
          _.partial(isDirectory, userDataPath),
          function(directory, callback) {
            chai.expect(directory).to.be.true;
            storage.clear(callback);
          },
          _.partial(isDirectory, userDataPath)
        ], function(error, directory) {
          chai.expect(error).to.not.exist;
          chai.expect(directory).to.be.true;
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
          chai.expect(error).to.not.exist;
          chai.expect(results).to.deep.equal([ 'foo', 'bar.json' ]);
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
            chai.expect(results.foo).to.be.true;
            chai.expect(results.bar).to.be.true;
            chai.expect(results.baz).to.be.true;

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
          chai.expect(error).to.not.exist;
          chai.expect(results.foo).to.be.false;
          chai.expect(results.bar).to.be.false;
          chai.expect(results.baz).to.be.false;
          done();
        });
      });

    });

  });

});
