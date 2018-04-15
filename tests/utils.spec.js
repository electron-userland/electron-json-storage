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
const path = require('path');
const utils = require('../lib/utils');
const electron = require('electron');
const os = require('os');
const app = electron.app || electron.remote.app;

describe('Utils', function() {

  this.timeout(20000);

  describe('.getDataPath()', function() {

    it('should return an absolute path', function() {
      m.chai.expect(path.isAbsolute(utils.getDataPath())).to.be.true;
    });

    it('should equal the dirname of the path returned by getFileName()', function() {
      const fileName = utils.getFileName('foo');
      const userDataPath = utils.getDataPath();
      m.chai.expect(path.dirname(fileName)).to.equal(userDataPath);
    });

    it('should pick up external changes to the userData path', function() {
      utils.setDataPath(undefined);
      const oldDataPath = app.getPath('userData');
      m.chai.expect(utils.getDataPath().indexOf(oldDataPath)).to.equal(0);
      const newPath = os.platform() === 'win32' ? 'C:\\foo' : '/foo';
      app.setPath('userData', newPath);
      m.chai.expect(utils.getDataPath().indexOf(newPath)).to.equal(0);
      app.setPath('userData', oldDataPath);
    });

  });

  describe('.setDataPath()', function() {

    beforeEach(function() {
      utils.setDataPath(utils.getDefaultDataPath());
    });

    it('should be able to go back to the default', function() {
      utils.setDataPath(path.join(os.tmpdir(), 'foo'));
      m.chai.expect(utils.getDataPath()).to.not.equal(utils.getDefaultDataPath());
      utils.setDataPath(utils.getDefaultDataPath());
      m.chai.expect(utils.getDataPath()).to.equal(utils.getDefaultDataPath());
    });

    it('should change the user data path', function() {
      const newUserDataPath = path.join(utils.getDataPath(), 'foo' , 'bar');
      utils.setDataPath(newUserDataPath);
      m.chai.expect(utils.getDataPath()).to.equal(newUserDataPath);
    });

    it('should throw if path is not absolute', function() {
      m.chai.expect(function() {
        utils.setDataPath('testpath/storage');
      }).to.throw('The user data path should be an absolute directory');
    });

  });

  describe('.getFileName()', function() {

    it('should throw if no key', function() {
      m.chai.expect(function() {
        utils.getFileName(null);
      }).to.throw('Missing key');
    });

    it('should throw if key is not a string', function() {
      m.chai.expect(function() {
        utils.getFileName(123);
      }).to.throw('Invalid key');
    });

    it('should throw if key is a blank string', function() {
      m.chai.expect(function() {
        utils.getFileName('    ');
      }).to.throw('Invalid key');
    });

    it('should append the .json extension automatically', function() {
      const fileName = utils.getFileName('foo');
      m.chai.expect(path.basename(fileName)).to.equal('foo.json');
    });

    it('should not add .json twice', function() {
      const fileName = utils.getFileName('foo.json');
      m.chai.expect(path.basename(fileName)).to.equal('foo.json');
    });

    it('should preserve an extension other than .json', function() {
      const fileName = utils.getFileName('foo.data');
      m.chai.expect(path.basename(fileName)).to.equal('foo.data.json');
    });

    it('should return an absolute path', function() {
      const fileName = utils.getFileName('foo.data');
      m.chai.expect(path.isAbsolute(fileName)).to.be.true;
    });

    it('should encode special characters', function() {
      const fileName = utils.getFileName('foo?bar:baz');
      m.chai.expect(path.basename(fileName)).to.equal('foo%3Fbar%3Abaz.json');
    });

    // HTTP encoding doesn't help us here
    it('should replace asterisks with hyphens', function() {
      const fileName = utils.getFileName('john6638@gmail*dot*com');
      m.chai.expect(path.basename(fileName)).to.equal('john6638%40gmail-dot-com.json');
    });

    it('should allow spaces in file names', function() {
      const fileName = utils.getFileName('foo bar');
      m.chai.expect(path.basename(fileName)).to.equal('foo bar.json');
    });

    it('should react to user data path changes', function() {
      const newUserDataPath = path.join(utils.getDataPath(), 'foo' , 'bar');
      utils.setDataPath(newUserDataPath);
      const fileName = utils.getFileName('foo');
      m.chai.expect(path.dirname(fileName)).to.equal(newUserDataPath);
    });

    it('should accept a custom data path', function() {
      const dataPath = path.join('my', 'custom', 'data', 'path');
      const fileName = utils.getFileName('foo', {
        dataPath: dataPath
      });

      m.chai.expect(fileName).to.equal(path.join(dataPath, 'foo.json'));
    });

  });

});
