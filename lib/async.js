'use strict';

const storage = require('./storage');
const utils = require('./utils');

/**
 * @summary Get the default data path
 * @function
 * @public
 *
 * @returns {String} default data path
 *
 * @example
 * const defaultDataPath = storage.getDefaultDataPath()
 */
exports.getDefaultDataPath = storage.getDefaultDataPath;

/**
 * @summary Set current data path
 * @function
 * @public
 *
 * @description
 * The default value will be used if the directory is undefined.
 *
 * @param {(String|Undefined)} directory - directory
 *
 * @example
 * const os = require('os');
 * const storage = require('electron-json-storage');
 *
 * storage.setDataPath(os.tmpdir());
 */
exports.setDataPath = storage.setDataPath;

/**
 * @summary Get current user data path
 * @function
 * @public
 *
 * @description
 * Returns the current data path. It defaults to a directory called
 * "storage" inside Electron's `userData` path.
 *
 * @returns {String} the user data path
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * const dataPath = storage.getDataPath();
 * console.log(dataPath);
 */
exports.getDataPath = storage.getDataPath;

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
 * @param {Object} [options] - options
 * @param {String} [options.dataPath] - data path
 * @param {Promise}
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.get('foobar')
 *  .then(data => console.log(data))
 *  .catch(error => throw error);
 *
 * const result = await storage.get('foobar');
 */
exports.get = (key, options) => new Promise((resolve, reject) => {
  storage.get(key, options, utils.callbackToPromise.bind(null, resolve, reject));
});

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
 * @param {Object} [options] - options
 * @param {String} [options.dataPath] - data path
 * @param {Promise}
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.getMany([ 'foobar', 'barbaz' ])
 *  .then(data => {
 *    console.log(data.foobar);
 *    console.log(data.barbaz);
 *  })
 *  .catch(error => throw error);
 *
 * const result = await storage.getMany([ 'foobar', 'barbaz' ]);
 */
exports.getMany = (keys, options) => new Promise((resolve, reject) => {
  storage.getMany(keys, options, utils.callbackToPromise.bind(null, resolve, reject));
});

/**
 * @summary Read all user data
 * @function
 * @public
 *
 * @description
 * This function returns an empty object if there is no data to be read.
 *
 * @param {Object} [options] - options
 * @param {String} [options.dataPath] - data path
 * @param {Promise}
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.getAll()
 *  .then(data => console.log(data))
 *  .catch(error => throw error);
 *
 * const result = await storage.getAll();
 * });
 */
exports.getAll = options => new Promise((resolve, reject) => {
  storage.getAll(options, utils.callbackToPromise.bind(null, resolve, reject));
});

/**
 * @summary Write user data
 * @function
 * @public
 *
 * @param {String} key - key
 * @param {Object} json - json object
 * @param {Object} [options] - options
 * @param {String} [options.dataPath] - data path
 * @param {Promise}
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.set('foobar', { foo: 'bar' })
 *  .catch(error => throw error);
 *
 * const result = await storage.set('foobar', { foo: 'bar' });
 */
exports.set = (key, json, options) => new Promise((resolve, reject) => {
  storage.set(key, json, options, utils.callbackToPromise.bind(null, resolve, reject));
});

/**
 * @summary Check if a key exists
 * @function
 * @public
 *
 * @param {String} key - key
 * @param {Object} [options] - options
 * @param {String} [options.dataPath] - data path
 * @param {Promise}
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.has('foobar')
 *  .then(hasKey => {
 *    if (hasKey) {
 *      console.log('There is data stored as `foobar`');
 *    }
 *  })
 *  .catch(error => throw error);
 *
 * const resut = await storage.has('foobar');
 */
exports.has = (key, options) => new Promise((resolve, reject) => {
  storage.has(key, options, utils.callbackToPromise.bind(null, resolve, reject));
});

/**
 * @summary Get the list of saved keys
 * @function
 * @public
 *
 * @param {Object} [options] - options
 * @param {String} [options.dataPath] - data path
 * @param {Promise}
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.keys()
 *  .then(keys => {
 *    for (var key of keys) {
 *      console.log('There is a key called: ' + key);
 *    }
 *  })
 *  .catch(error => throw error);
 *
 *  const result = await storage.keys();
 * });
 */
exports.keys = options => new Promise((resolve, reject) => {
  storage.keys(options, utils.callbackToPromise.bind(null, resolve, reject));
});

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
 * @param {Object} [options] - options
 * @param {String} [options.dataPath] - data path
 * @param {Promise}
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.remove('foobar')
 *  .catch(error => throw error);
 *
 * const result = await storage.remove('foobar');
 */
exports.remove = (key, options) => new Promise((resolve, reject) => {
  storage.remove(key, options, utils.callbackToPromise.bind(null, resolve, reject));
});

/**
 * @summary Clear all stored data in the current user data path
 * @function
 * @public
 *
 * @param {Object} [options] - options
 * @param {String} [options.dataPath] - data path
 * @param {Promise}
 *
 * @example
 * const storage = require('electron-json-storage');
 *
 * storage.clear()
 *  .catch(error) => throw error);
 *
 * const result = await storage.clear();
 */
exports.clear = options => new Promise((resolve, reject) => {
  storage.clear(options, utils.callbackToPromise.bind(null, resolve, reject));
});
