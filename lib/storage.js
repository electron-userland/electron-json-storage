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

/**
 * @module storage
 */

const Bluebird = require('bluebird');
const fs = Bluebird.promisifyAll(require('fs'));
const rimraf = Bluebird.promisify(require('rimraf'));
const path = require('path');
const utils = require('./utils');

function coalesceReturn(callback, promise) {
  if (typeof callback === 'function') {
    return;
  }
  return promise;
}

/**
 * @summary Read user data
 * @function
 * @public
 *
 * @description
 * If the key doesn't exist in the user data, an empty object is returned.
 * Also notice that the `.json` extension is added automatically, but it's
 * ignored if you pass it yourself.
 *
 * Passing an extension other than `.json` will result in a file created
 * with both extensions. For example, the key `foo.data` will result in a file
 * called `foo.data.json`.
 *
 * @param {String} key - key
 * @fulfil {Object} - contents
 * @returns {Promise}
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.get('foobar').then(function(data) {
 *   console.log(data);
 * });
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.get('foobar', function(error, data) {
 *   if (error) throw error;
 *
 *   console.log(data);
 * });
 */
exports.get = function(key, callback) {
  var promise = Bluebird.try(function() {
    const fileName = utils.getFileName(key);
    return fs.readFileAsync(fileName, { encoding: 'utf8' });
  }).catch(function(error) {
    if (error.code === 'ENOENT') {
      return JSON.stringify({});
    }

    throw error;
  }).then(function(object) {
    try {
      return JSON.parse(object);
    } catch (error) {
      throw new Error('Invalid data');
    }
  }).nodeify(callback);

  return coalesceReturn(callback, promise);
};

/**
 * @summary Write user data
 * @function
 * @public
 *
 * @param {String} key - key
 * @param {Object} json - json object
 * @returns {Promise}
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.set('foobar', { foo: 'bar' });
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.set('foobar', { foo: 'bar' }, function(error) {
 *   if (error) throw error;
 * });
 */
exports.set = function(key, json, callback) {
  var promise = Bluebird.try(function() {
    const fileName = utils.getFileName(key);
    const data = JSON.stringify(json);

    if (!data) {
      throw new Error('Invalid JSON data');
    }

    return fs.writeFileAsync(fileName, data);
  }).nodeify(callback);

  return coalesceReturn(callback, promise);
};

/**
 * @summary Check if a key exists
 * @function
 * @public
 *
 * @param {String} key - key
 * @fulfil {Boolean} - whether the key exists
 * @returns {Promise}
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.has('foobar').then(function(hasKey) {
 *   if (hasKey) {
 *     console.log('There is data stored as `foobar`');
 *   }
 * });
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.has('foobar', function(error, data) {
 *   if (error) throw error;
 *
 *   if (hasKey) {
 *     console.log('There is data stored as `foobar`');
 *   }
 * });
 */
exports.has = function(key, callback) {
  var promise = Bluebird.try(function() {
    const fileName = utils.getFileName(key);
    return fs.statAsync(fileName).return(true);
  }).catch(function(error) {
    if (error.code === 'ENOENT') {
      return false;
    }

    throw error;
  }).nodeify(callback);

  return coalesceReturn(callback, promise);
};

/**
 * @summary Get the list of saved keys
 * @function
 * @public
 *
 * @fulfil {String[]} - saved keys
 * @returns {Promise}
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.keys().then(function(keys) {
 *   for (var key of keys) {
 *     console.log('There is a key called: ' + key);
 *   }
 * });
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.keys(function(error, keys) {
 *   if (error) throw error;
 *
 *   for (var key of keys) {
 *     console.log('There is a key called: ' + key);
 *   }
 * });
 */
exports.keys = function(callback) {
  const userData = utils.getUserDataPath();
  var promise = fs.readdirAsync(userData).map(function(key) {
    return path.basename(key, '.json');
  }).nodeify(callback);

  return coalesceReturn(callback, promise);
};

/**
 * @summary Remove a key
 * @function
 * @public
 *
 * @description
 * Notice this function does nothing, nor throws any error
 * if the key doesn't exist.
 *
 * @param {String} key - key
 * @returns {Promise}
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.remove('foobar');
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.remove('foobar', function(error) {
 *   if (error) throw error;
 * });
 */
exports.remove = function(key, callback) {
  var promise = Bluebird.try(function() {
    const fileName = utils.getFileName(key);
    return rimraf(fileName);
  }).nodeify(callback);

  return coalesceReturn(callback, promise);
};

/**
 * @summary Clear all stored data
 * @function
 * @public
 *
 * @returns {Promise}
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.clear();
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.clear(function(error) {
 *   if (error) throw error;
 * });
 */
exports.clear = function(callback) {
  const userData = utils.getUserDataPath();
  const jsonFiles = path.join(userData, '*.json');
  var promise = rimraf(jsonFiles).nodeify(callback);
  return coalesceReturn(callback, promise);
};
