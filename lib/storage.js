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
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const path = require('path');
const RWlock = require('rwlock');
const utils = require('./utils');
const lock = new RWlock();

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
      var objectJSON = {};
      try {
        objectJSON = JSON.parse(object);
      } catch (error) {
        return callback(new Error('Invalid data: ' + object));
      }
      return callback(null, objectJSON);
    }
  ], callback);
};

/**
 * @summary Read many user data keys
 * @function
 * @public
 *
 * @description
 * This function returns an object with the data of all the passed keys.
 * If one of the keys doesn't exist, an empty object is returned for it.
 *
 * @param {String[]} keys - keys
 * @param {Function} callback - callback (error, data)
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.getMany([ 'foobar', 'barbaz' ], function(error, data) {
 *   if (error) throw error;
 *
 *   console.log(data.foobar);
 *   console.log(data.barbaz);
 * });
 */
exports.getMany = function(keys, callback) {
  async.reduce(keys, {}, function(reducer, key, callback) {
    exports.get(key, function(error, data) {
      if (error) {
        return callback(error);
      }

      return callback(null, _.set(reducer, key, data));
    });
  }, callback);
};

/**
 * @summary Read all user data
 * @function
 * @public
 *
 * @description
 * This function returns an empty object if there is no data to be read.
 *
 * @param {Function} callback - callback (error, data)
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.getAll(function(error, data) {
 *   if (error) throw error;
 *
 *   console.log(data);
 * });
 */
exports.getAll = function(callback) {
  async.waterfall([
    exports.keys,
    function(keys, callback) {
      async.reduce(keys, {}, function(reducer, key, callback) {
        async.waterfall([
          _.partial(exports.get, key),
          function(contents, callback) {
            return callback(null, _.set(reducer, key, contents));
          }
        ], callback);
      }, callback);
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

      // Create the directory in case it doesn't exist yet
      mkdirp(path.dirname(fileName), function(error) {
        if (error) {
          return callback(error);
        }

        // Ensure parallel writes don't corrupt the data
        lock.writeLock(function(releaseLock) {
          fs.writeFile(fileName, data, function(error) {
            releaseLock();
            return callback(error);
          });
        });
      });

    }
  ], callback);
};

/**
 * @summary Write user data sync
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
 * storage.setSync('foobar', { foo: 'bar' }, function(error) {
 *   if (error) throw error;
 * });
 */
exports.setSync = function(key, json, callback) {
  const fileName = utils.getFileName(key);
  const data = JSON.stringify(json);
  try{
    mkdirp.sync(path.dirname(fileName));
    fs.writeFileSync(fileName, data, callback);
  }
  catch (error){
    callback(error);
  }
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
    function(filename, done) {
      fs.stat(filename, (error) => {
        if (error) {
          if (error.code === 'ENOENT') {
            return done(null, false);
          }

          return done(error);
        }

        return done(null, true);
      });
    }
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
    function(userDataPath, callback) {
      mkdirp(userDataPath, function(error) {
        return callback(error, userDataPath);
      });
    },
    fs.readdir,
    function(keys, callback) {
      callback(null, _.map(_.reject(keys, function(key) {
        return _.includes([ '.DS_Store' ], key);
      }), function(key) {
        return path.basename(key, '.json');
      }));
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
