/*
 * The MIT License
 *
 * Copyright (c) 2018 Juan Cruz Viotti. https://github.com/jviotti
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

const lockFile = require('../vendor/lockfile');

/**
 * @summary Lock options
 * @type {Object}
 * @private
 */
const lockOptions = {
  stale: 10000,
  retries: 1000,
  retryWait: 50
};

/**
 * @summary Create a lock file
 * @function
 * @public
 *
 * @param {String} file - lock file
 * @param {Function} callback - callback (error)
 *
 * @example
 * lock.lock('foo.lock', function(error) {
 *   if (error) {
 *     throw error;
 *   }
 * })
 */
exports.lock = function(file, callback, times) {
  times = times || 0;

  lockFile.lock(file, lockOptions, function(error) {
    if (error && error.code === 'EPERM' && times < 10) {
      setTimeout(function() {
        exports.lock(file, callback, times + 1);
      }, 1000);
      return;
    }

    return callback(error);
  });
};

/**
 * @summary Create a lock file (sync)
 * @function
 * @public
 *
 * @param {String} file - lock file
 *
 * @example
 * lock.lockSync('foo.lock');
 */
exports.lockSync = function(file, times) {
  times = times || 0;

  try {
    lockFile.lockSync(file, {
      stale: lockOptions.stale,
      retries: lockOptions.retries
    });
  } catch (error) {
    if (error && error.code === 'EPERM' && times < 10) {
      return exports.lockSync(file, times + 1);
    }

    throw error;
  }
};

/**
 * @summary Unlock a locked file
 * @function
 * @public
 *
 * @param {String} file - lock file
 * @param {Function} callback - callback (error)
 *
 * @example
 * lock.unlock('foo.lock', function(error) {
 *   if (error) {
 *     throw error;
 *   }
 * })
 */
exports.unlock = function(file, callback, times) {
  times = times || 0;

  lockFile.unlock(file, function(error) {
    if (error && error.code === 'EPERM' && times < 10) {
      setTimeout(function() {
        exports.unlock(file, callback, times + 1);
      }, 1000);
      return;
    }

    return callback(error);
  });
};

/**
 * @summary Unlock a locked file (sync)
 * @function
 * @public
 *
 * @param {String} file - lock file
 *
 * @example
 * lock.unlockSync('foo.lock');
 */
exports.unlockSync = function(file, times) {
  times = times || 0;

  try {
    lockFile.unlockSync(file);
  } catch (error) {
    if (error && error.code === 'EPERM' && times < 10) {
      return exports.unlockSync(file, times + 1);
    }

    throw error;
  }
};
