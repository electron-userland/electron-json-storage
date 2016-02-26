electron-json-storage
=====================

> Easily write and read user settings in Electron apps

[![npm version](https://badge.fury.io/js/electron-json-storage.svg)](http://badge.fury.io/js/electron-json-storage)
[![dependencies](https://david-dm.org/jviotti/electron-json-storage.svg)](https://david-dm.org/jviotti/electron-json-storage.svg)
[![Build Status](https://travis-ci.org/jviotti/electron-json-storage.svg?branch=master)](https://travis-ci.org/jviotti/electron-json-storage)
[![Build status](https://ci.appveyor.com/api/projects/status/j9k3k7mgraardwvd/branch/master?svg=true)](https://ci.appveyor.com/project/jviotti/electron-json-storage/branch/master)

[Electron](http://electron.atom.io) lacks an easy way to persist and read user settings for your application. `electron-json-storage` implements an API somehow similar to [localStorage](https://developer.mozilla.org/en/docs/Web/API/Window/localStorage) to write and read JSON objects to/from the operating system application data directory, as defined by `app.getPath('userData')`.

Installation
------------

Install `electron-json-storage` by running:

```sh
$ npm install --save electron-json-storage
```

You can require this module from either the **main** or **renderer** process (with and without `remote`).

Documentation
-------------


* [storage](#module_storage)
    * [.get(key, callback)](#module_storage.get)
    * [.set(key, json, callback)](#module_storage.set)
    * [.has(key, callback)](#module_storage.has)
    * [.keys(callback)](#module_storage.keys)
    * [.remove(key, callback)](#module_storage.remove)
    * [.clear(callback)](#module_storage.clear)

<a name="module_storage.get"></a>
### storage.get(key, callback)
If the key doesn't exist in the user data, an empty object is returned.
Also notice that the `.json` extension is added automatically, but it's
ignored if you pass it yourself.

Passing an extension other than `.json` will result in a file created
with both extensions. For example, the key `foo.data` will result in a file
called `foo.data.json`.

**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Read user data  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | key |
| callback | <code>function</code> | callback (error, data) |

**Example**  
```js
const storage = require('electron-json-storage');

storage.get('foobar', function(error, data) {
  if (error) throw error;

  console.log(data);
});
```
<a name="module_storage.set"></a>
### storage.set(key, json, callback)
**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Write user data  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | key |
| json | <code>Object</code> | json object |
| callback | <code>function</code> | callback (error) |

**Example**  
```js
const storage = require('electron-json-storage');

storage.set('foobar', { foo: 'bar' }, function(error) {
  if (error) throw error;
});
```
<a name="module_storage.has"></a>
### storage.has(key, callback)
**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Check if a key exists  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | key |
| callback | <code>function</code> | callback (error, hasKey) |

**Example**  
```js
const storage = require('electron-json-storage');

storage.has('foobar', function(error, hasKey) {
  if (error) throw error;

  if (hasKey) {
    console.log('There is data stored as `foobar`');
  }
});
```
<a name="module_storage.keys"></a>
### storage.keys(callback)
**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Get the list of saved keys  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | callback (error, keys) |

**Example**  
```js
const storage = require('electron-json-storage');

storage.keys(function(error, keys) {
  if (error) throw error;

  for (var key of keys) {
    console.log('There is a key called: ' + key);
  }
});
```
<a name="module_storage.remove"></a>
### storage.remove(key, callback)
Notice this function does nothing, nor throws any error
if the key doesn't exist.

**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Remove a key  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | key |
| callback | <code>function</code> | callback (error) |

**Example**  
```js
const storage = require('electron-json-storage');

storage.remove('foobar', function(error) {
  if (error) throw error;
});
```
<a name="module_storage.clear"></a>
### storage.clear(callback)
**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Clear all stored data  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | callback (error) |

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
