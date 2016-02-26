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

const _ = require('lodash');
const async = require('async');
const fs = require('fs');
const exists = require('exists-file');
const rimraf = require('rimraf');
const path = require('path');
const utils = require('./utils');

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
 * @param {Function} callback - callback (error, data)
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
  async.waterfall([
    async.asyncify(_.partial(utils.getFileName, key)),
    function(fileName, callback) {
      fs.readFile(fileName, {
        encoding: 'utf8'
      }, function(error, object) {
        if (!error) {
          return callback(null, object);
        }

        if (error.code === 'ENOENT') {
          return callback(null, JSON.stringify({}));
        }

        return callback(error);
      });
    },
    function(object, callback) {
      try {
        callback(null, JSON.parse(object));
      } catch (error) {
        callback(new Error('Invalid data'));
      }
    }
  ], callback);
};

/**
 * @summary Write user data
 * @function
 * @public
 *
 * @param {String} key - key
 * @param {Object} json - json object
 * @param {Function} callback - callback (error)
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.set('foobar', { foo: 'bar' }, function(error) {
 *   if (error) throw error;
 * });
 */
exports.set = function(key, json, callback) {
  async.waterfall([
    async.asyncify(_.partial(utils.getFileName, key)),
    function(fileName, callback) {
      const data = JSON.stringify(json);

      if (!data) {
        return callback(new Error('Invalid JSON data'));
      }

      fs.writeFile(fileName, data, callback);
    }
  ], callback);
};

/**
 * @summary Check if a key exists
 * @function
 * @public
 *
 * @param {String} key - key
 * @param {Function} callback - callback (error, hasKey)
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.has('foobar', function(error, hasKey) {
 *   if (error) throw error;
 *
 *   if (hasKey) {
 *     console.log('There is data stored as `foobar`');
 *   }
 * });
 */
exports.has = function(key, callback) {
  async.waterfall([
    async.asyncify(_.partial(utils.getFileName, key)),
    exists
  ], callback);
};

/**
 * @summary Get the list of saved keys
 * @function
 * @public
 *
 * @param {Function} callback - callback (error, keys)
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
  async.waterfall([
    async.asyncify(utils.getUserDataPath),
    fs.readdir,
    function(keys, callback) {
      callback(null, _.chain(keys)
        .reject(function(key) {
          return _.includes([ 'GPUCache' ], key);
        })
        .map(function(key) {
          return path.basename(key, '.json');
        })
        .value());
    }
  ], callback);
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
 * @param {Function} callback - callback (error)
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.remove('foobar', function(error) {
 *   if (error) throw error;
 * });
 */
exports.remove = function(key, callback) {
  async.waterfall([
    async.asyncify(_.partial(utils.getFileName, key)),
    rimraf
  ], callback);
};

/**
 * @summary Clear all stored data
 * @function
 * @public
 *
 * @param {Function} callback - callback (error)
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
  rimraf(jsonFiles, callback);
};
