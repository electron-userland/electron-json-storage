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

const m = require('mochainon');
const _ = require('lodash');
const Bluebird = require('bluebird');
const fs = Bluebird.promisifyAll(require('fs'));
const storage = require('../lib/storage');
const utils = require('../lib/utils');

describe('Electron JSON Storage', function() {

  // Ensure each test case is always ran in a clean state
  beforeEach(storage.clear);

  describe('.get()', function() {

    it('should be rejected if no key', function() {
      const promise = storage.get();
      m.chai.expect(promise).to.be.rejectedWith('Missing key');
    });

    it('should be rejected if key is not a string', function() {
      const promise = storage.get(123);
      m.chai.expect(promise).to.be.rejectedWith('Invalid key');
    });

    it('should be rejected if key is a blank string', function() {
      const promise = storage.get('    ');
      m.chai.expect(promise).to.be.rejectedWith('Invalid key');
    });

    describe('given stored settings', function() {

      beforeEach(function(done) {
        storage.set('foo', { data: 'hello world' }, done);
      });

      it('should eventually become the data', function() {
        const promise = storage.get('foo');
        m.chai.expect(promise).to.become({ data: 'hello world' });
      });

      it('should eventually become the data if explicitly passing the extension', function() {
        const promise = storage.get('foo.json');
        m.chai.expect(promise).to.become({ data: 'hello world' });
      });

      it('should eventually become an empty object given an incorrect key', function() {
        const promise = storage.get('foobarbaz');
        m.chai.expect(promise).to.become({});
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

      it('should be rejected with an error', function() {
        const promise = storage.get('foo');
        m.chai.expect(promise).to.be.rejectedWith('Invalid data');
      });

    });

  });

  describe('.set()', function() {

    it('should be rejected if no key', function() {
      const promise = storage.set(null, { foo: 'bar' });
      m.chai.expect(promise).to.be.rejectedWith('Missing key');
    });

    it('should be rejected if key is not a string', function() {
      const promise = storage.set(123, { foo: 'bar' });
      m.chai.expect(promise).to.be.rejectedWith('Invalid key');
    });

    it('should be rejected if key is a blank string', function() {
      const promise = storage.set('    ', { foo: 'bar' });
      m.chai.expect(promise).to.be.rejectedWith('Invalid key');
    });

    it('should be rejected if data is not a valid JSON object', function() {
      const promise = storage.set('foo', _.noop);
      m.chai.expect(promise).to.be.rejectedWith('Invalid JSON data');
    });

    it('should be able to store a valid JSON object', function(done) {
      storage.set('foo', { foo: 'baz' }).then(function() {
        return storage.get('foo');
      }).then(function(data) {
        m.chai.expect(data).to.deep.equal({ foo: 'baz' });
      }).nodeify(done);
    });

    it('should ignore an explicit json extension', function(done) {
      storage.set('foo.json', { foo: 'baz' }).then(function() {
        return storage.get('foo');
      }).then(function(data) {
        m.chai.expect(data).to.deep.equal({ foo: 'baz' });
      }).nodeify(done);
    });

    describe('given an existing stored key', function() {

      beforeEach(function(done) {
        storage.set('foo', { foo: 'bar' }, done);
      });

      it('should be able to override the stored key', function(done) {
        storage.get('foo').then(function(data) {
          m.chai.expect(data).to.deep.equal({ foo: 'bar' });
        }).then(function() {
          return storage.set('foo', { foo: 'baz' });
        }).then(function() {
          return storage.get('foo');
        }).then(function(data) {
          m.chai.expect(data).to.deep.equal({ foo: 'baz' });
        }).nodeify(done);
      });

      it('should not override the stored key if the passed data is invalid', function(done) {
        storage.set('foo', _.noop).catch(function() {
          return storage.get('foo');
        }).then(function(data) {
          m.chai.expect(data).to.deep.equal({ foo: 'bar' });
        }).nodeify(done);
      });

    });

  });

  describe('.has()', function() {

    it('should be rejected if no key', function() {
      const promise = storage.has(null);
      m.chai.expect(promise).to.be.rejectedWith('Missing key');
    });

    it('should be rejected if key is not a string', function() {
      const promise = storage.has(123);
      m.chai.expect(promise).to.be.rejectedWith('Invalid key');
    });

    it('should be rejected if key is a blank string', function() {
      const promise = storage.has('    ');
      m.chai.expect(promise).to.be.rejectedWith('Invalid key');
    });

    describe('given a stored key', function() {

      beforeEach(function(done) {
        storage.set('foo', { foo: 'bar' }, done);
      });

      it('should eventually be true if the key exists', function() {
        const promise = storage.has('foo');
        m.chai.expect(promise).to.eventually.be.true;
      });

      it('should eventually be true if the key has a json extension', function() {
        const promise = storage.has('foo.json');
        m.chai.expect(promise).to.eventually.be.true;
      });

      it('should eventually be true if the key does not exist', function() {
        const promise = storage.has('hello');
        m.chai.expect(promise).to.eventually.be.false;
      });

    });

  });

  describe('.keys()', function() {

    it('should return an empty array if no keys', function() {
      const promise = storage.keys();
      m.chai.expect(promise).to.become([]);
    });

    it('should return a single key if there is one saved setting', function(done) {
      storage.set('foo', 'bar').then(function() {
        const promise = storage.keys();
        m.chai.expect(promise).to.become([ 'foo' ]);
      }).nodeify(done);
    });

    it('should ignore the .json extension', function(done) {
      storage.set('foo.json', 'bar').then(function() {
        const promise = storage.keys();
        m.chai.expect(promise).to.become([ 'foo' ]);
      }).nodeify(done);
    });

    it('should only remove the .json extension', function(done) {
      storage.set('foo.data', 'bar').then(function() {
        const promise = storage.keys();
        m.chai.expect(promise).to.become([ 'foo.data' ]);
      }).nodeify(done);
    });

    it('should detect multiple saved settings', function(done) {
      return Bluebird.all([
        storage.set('one', 'foo'),
        storage.set('two', 'bar'),
        storage.set('three', 'baz')
      ]).then(function() {
        const promise = storage.keys();
        m.chai.expect(promise).to.become([
          'one',
          'three',
          'two'
        ]);
      }).nodeify(done);
    });

  });

  describe('.remove()', function() {

    it('should be rejected if no key', function() {
      const promise = storage.remove(null);
      m.chai.expect(promise).to.be.rejectedWith('Missing key');
    });

    it('should be rejected if key is not a string', function() {
      const promise = storage.remove(123);
      m.chai.expect(promise).to.be.rejectedWith('Invalid key');
    });

    it('should be rejected if key is a blank string', function() {
      const promise = storage.remove('    ');
      m.chai.expect(promise).to.be.rejectedWith('Invalid key');
    });

    describe('given a stored key', function() {

      beforeEach(function(done) {
        storage.set('foo', { foo: 'bar' }, done);
      });

      it('should be able to remove the key', function(done) {
        storage.has('foo').then(function(hasKey) {
          m.chai.expect(hasKey).to.be.true;
          return storage.remove('foo');
        }).then(function() {
          return storage.has('foo');
        }).then(function(hasKey) {
          m.chai.expect(hasKey).to.be.false;
        }).nodeify(done);
      });

      it('should do nothing if the key does not exist', function(done) {
        storage.has('bar').then(function(hasKey) {
          m.chai.expect(hasKey).to.be.false;
          return storage.remove('bar');
        }).then(function() {
          return storage.has('bar');
        }).then(function(hasKey) {
          m.chai.expect(hasKey).to.be.false;
        }).nodeify(done);
      });

    });

  });

  describe('.clear()', function() {

    it('should not be rejected if no keys', function() {
      const promise = storage.clear();
      m.chai.expect(promise).to.eventually.be.undefined;
    });

    describe('given a stored key', function() {

      beforeEach(function(done) {
        storage.set('foo', { foo: 'bar' }, done);
      });

      it('should clear the key', function(done) {
        storage.has('foo').then(function(hasKey) {
          m.chai.expect(hasKey).to.be.true;
          return storage.clear();
        }).then(function() {
          return storage.has('foo');
        }).then(function(hasKey) {
          m.chai.expect(hasKey).to.be.false;
        }).nodeify(done);
      });

      it('should not delete the user data directory', function(done) {
        const isDirectory = function(dir) {
          return fs.statAsync(dir).catch(function(error) {
            if (error.code === 'ENOENT') {
              return false;
            }

            throw error;
          }).then(function(stats) {
            return stats.isDirectory();
          });
        };

        const userDataPath = utils.getUserDataPath();

        isDirectory(userDataPath).then(function(exists) {
          m.chai.expect(exists).to.be.true;
          return storage.clear();
        }).then(function() {
          return isDirectory(userDataPath);
        }).then(function(exists) {
          m.chai.expect(exists).to.be.true;
        }).nodeify(done);
      });

    });

    describe('given many stored keys', function() {

      beforeEach(function(done) {
        Bluebird.all([
          storage.set('foo', { name: 'foo' }),
          storage.set('bar', { name: 'bar' }),
          storage.set('baz', { name: 'baz' })
        ]).nodeify(done);
      });

      it('should clear all stored keys', function(done) {
        Bluebird.props({
          foo: storage.has('foo'),
          bar: storage.has('bar'),
          baz: storage.has('baz')
        }).then(function(results) {
          m.chai.expect(results.foo).to.be.true;
          m.chai.expect(results.bar).to.be.true;
          m.chai.expect(results.baz).to.be.true;

          return storage.clear();
        }).then(function() {
          return Bluebird.props({
            foo: storage.has('foo'),
            bar: storage.has('bar'),
            baz: storage.has('baz')
          });
        }).then(function(results) {
          m.chai.expect(results.foo).to.be.false;
          m.chai.expect(results.bar).to.be.false;
          m.chai.expect(results.baz).to.be.false;

        }).nodeify(done);
      });

    });

  });

});
