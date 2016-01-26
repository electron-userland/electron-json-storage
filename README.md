electron-json-storage
=====================

> Easily write and read user settings in Electron apps

[![npm version](https://badge.fury.io/js/electron-json-storage.svg)](http://badge.fury.io/js/electron-json-storage)
[![dependencies](https://david-dm.org/jviotti/electron-json-storage.svg)](https://david-dm.org/jviotti/electron-json-storage.svg)
[![Build Status](https://travis-ci.org/jviotti/electron-json-storage.svg?branch=master)](https://travis-ci.org/jviotti/electron-json-storage)
[![Build status](https://ci.appveyor.com/api/projects/status/j9k3k7mgraardwvd/branch/master?svg=true)](https://ci.appveyor.com/project/jviotti/electron-json-storage/branch/master)

[Electron](http://electron.atom.io) lacks an easy way to persist and read user settings for your application. `electron-json-storage` implements an API with promises and callback support somehow similar to [localStorage](https://developer.mozilla.org/en/docs/Web/API/Window/localStorage) to write and read JSON objects to/from the operating system application data directory, as defined by `app.getPath('userData')`.

Installation
------------

Install `electron-json-storage` by running:

```sh
$ npm install --save electron-json-storage
```

Documentation
-------------


* [storage](#module_storage)
    * [.get(key)](#module_storage.get) ⇒ <code>Promise</code>
    * [.set(key, json)](#module_storage.set) ⇒ <code>Promise</code>
    * [.has(key)](#module_storage.has) ⇒ <code>Promise</code>
    * [.remove(key)](#module_storage.remove) ⇒ <code>Promise</code>
    * [.clear()](#module_storage.clear) ⇒ <code>Promise</code>

<a name="module_storage.get"></a>
### storage.get(key) ⇒ <code>Promise</code>
If the key doesn't exist in the user data, an empty object is returned.
Also notice that the `.json` extension is added automatically, but it's
ignored if you pass it yourself.

Passing an extension other than `.json` will result in a file created
with both extensions. For example, the key `foo.data` will result in a file
called `foo.data.json`.

**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Read user data  
**Access:** public  
**Fulfil**: <code>Object</code> - contents  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | key |

**Example**  
```js
const storage = require('electron-json-storage');

storage.get('foobar').then(function(data) {
  console.log(data);
});
```
**Example**  
```js
const storage = require('electron-json-storage');

storage.get('foobar', function(error, data) {
  if (error) throw error;

  console.log(data);
});
```
<a name="module_storage.set"></a>
### storage.set(key, json) ⇒ <code>Promise</code>
**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Write user data  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | key |
| json | <code>Object</code> | json object |

**Example**  
```js
const storage = require('electron-json-storage');

storage.set('foobar', { foo: 'bar' }).then(function(data) {
  console.log(data);
});
```
**Example**  
```js
const storage = require('electron-json-storage');

storage.set('foobar', { foo: 'bar' }, function(error, data) {
  if (error) throw error;

  console.log(data);
});
```
<a name="module_storage.has"></a>
### storage.has(key) ⇒ <code>Promise</code>
**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Check if a key exists  
**Access:** public  
**Fulfil**: <code>Boolean</code> - whether the key exists  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | key |

**Example**  
```js
const storage = require('electron-json-storage');

storage.has('foobar').then(function(hasKey) {
  if (hasKey) {
    console.log('There is data stored as `foobar`');
  }
});
```
**Example**  
```js
const storage = require('electron-json-storage');

storage.has('foobar', function(error, data) {
  if (error) throw error;

  if (hasKey) {
    console.log('There is data stored as `foobar`');
  }
});
```
<a name="module_storage.remove"></a>
### storage.remove(key) ⇒ <code>Promise</code>
Notice this function does nothing, nor throws any error
if the key doesn't exist.

**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Remove a key  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | key |

**Example**  
```js
const storage = require('electron-json-storage');

storage.remove('foobar');
```
**Example**  
```js
const storage = require('electron-json-storage');

storage.remove('foobar', function(error) {
  if (error) throw error;
});
```
<a name="module_storage.clear"></a>
### storage.clear() ⇒ <code>Promise</code>
**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Clear all stored data  
**Access:** public  
**Example**  
```js
const storage = require('electron-json-storage');

storage.clear();
```
**Example**  
```js
const storage = require('electron-json-storage');

storage.clear(function(error) {
  if (error) throw error;
});
```

Support
-------

If you're having any problem, please [raise an issue](https://github.com/jviotti/electron-json-storage/issues/new) on GitHub and I'll be happy to help.

Tests
-----

Run the test suite by doing:

```sh
$ npm test
```

Contribute
----------

- Issue Tracker: [github.com/jviotti/electron-json-storage/issues](https://github.com/jviotti/electron-json-storage/issues)
- Source Code: [github.com/jviotti/electron-json-storage](https://github.com/jviotti/electron-json-storage)

Before submitting a PR, please make sure that you include tests, and that [jshint](http://jshint.com) runs without any warning:

```sh
$ npm run-script lint
```

License
-------

The project is licensed under the MIT license.
