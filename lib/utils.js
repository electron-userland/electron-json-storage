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

const _ = require('lodash');
const path = require('path');
const electron = require('electron');
const app = electron.app || electron.remote.app;
const userData = app.getPath('userData');

/**
 * @summary Get user data directory path
 * @function
 * @public
 *
 * @returns {Strings} user data path
 *
 * let userDataPath = utils.getUserDataPath();
 * console.log(userDataPath);
 */
exports.getUserDataPath = function() {
  return userData;
};

/**
 * @summary Get storage file name for a key
 * @function
 * @public
 *
 * @param {String} key - key
 * @returns {String} file name
 *
 * @example
 * let fileName = utils.getFileName('foo');
 * console.log(fileName);
 */
exports.getFileName = function(key) {
  if (!key) {
    throw new Error('Missing key');
  }

  if (!_.isString(key) || key.trim().length === 0) {
    throw new Error('Invalid key');
  }

  // Trick to prevent adding the `.json` twice
  // if the key already contains it.
  const keyFileName = path.basename(key, '.json') + '.json';

  return path.join(exports.getUserDataPath(), keyFileName);
};
