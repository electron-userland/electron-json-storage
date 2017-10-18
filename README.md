electron-json-storage
=====================

> Easily write and read user settings in Electron apps

[![npm version](https://badge.fury.io/js/electron-json-storage.svg)](http://badge.fury.io/js/electron-json-storage)
[![dependencies](https://david-dm.org/jviotti/electron-json-storage.svg)](https://david-dm.org/jviotti/electron-json-storage.svg)
[![Build Status](https://travis-ci.org/electron-userland/electron-json-storage.svg?branch=master)](https://travis-ci.org/electron-userland/electron-json-storage)
[![Build status](https://ci.appveyor.com/api/projects/status/ulwk1nnh7l8209xg/branch/master?svg=true)](https://ci.appveyor.com/project/electron-userland/electron-json-storage/branch/master)

[Electron](http://electron.atom.io) lacks an easy way to persist and read user settings for your application. `electron-json-storage` implements an API somehow similar to [localStorage](https://developer.mozilla.org/en/docs/Web/API/Window/localStorage) to write and read JSON objects to/from the operating system application data directory, as defined by `app.getPath('userData')`.

Related modules:

- [electron-settings](https://github.com/nathanbuchar/electron-settings)
- [electron-store](https://github.com/sindresorhus/electron-store)
- [electron-storage](https://github.com/Cocycles/electron-storage)

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
    * [.getDefaultDataPath()](#module_storage.getDefaultDataPath) ⇒ <code>String</code>
    * [.setDataPath(directory)](#module_storage.setDataPath)
    * [.getDataPath()](#module_storage.getDataPath) ⇒ <code>String</code>
    * [.get(key, [options], callback)](#module_storage.get)
    * [.getMany(keys, [options], callback)](#module_storage.getMany)
    * [.getAll([options], callback)](#module_storage.getAll)
    * [.set(key, json, [options], callback)](#module_storage.set)
    * [.has(key, [options], callback)](#module_storage.has)
    * [.keys([options], callback)](#module_storage.keys)
    * [.remove(key, [options], callback)](#module_storage.remove)
    * [.clear([options], callback)](#module_storage.clear)

<a name="module_storage.getDefaultDataPath"></a>

### storage.getDefaultDataPath() ⇒ <code>String</code>
**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Get the default data path  
**Returns**: <code>String</code> - default data path  
**Access:** public  
**Example**  
```js
const defaultDataPath = storage.getDefaultDataPath()
```
<a name="module_storage.setDataPath"></a>

### storage.setDataPath(directory)
The default value will be used if the directory is undefined.

**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Set current data path  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| directory | <code>String</code> &#124; <code>Undefined</code> | directory |

**Example**  
```js
const os = require('os');
const storage = require('electron-json-storage');

storage.setDataPath(os.tmpdir());
```
<a name="module_storage.getDataPath"></a>

### storage.getDataPath() ⇒ <code>String</code>
Returns the current data path. It defaults to a directory called
"storage" inside Electron's `userData` path.

**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Get current user data path  
**Returns**: <code>String</code> - the user data path  
**Access:** public  
**Example**  
```js
const storage = require('electron-json-storage');

const dataPath = storage.getDataPath();
console.log(dataPath);
```
<a name="module_storage.get"></a>

### storage.get(key, [options], callback)
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
| [options] | <code>Object</code> | options |
| [options.dataPath] | <code>String</code> | data path |
| callback | <code>function</code> | callback (error, data) |

**Example**  
```js
const storage = require('electron-json-storage');

storage.get('foobar', function(error, data) {
  if (error) throw error;

  console.log(data);
});
```
<a name="module_storage.getMany"></a>

### storage.getMany(keys, [options], callback)
This function returns an object with the data of all the passed keys.
If one of the keys doesn't exist, an empty object is returned for it.

**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Read many user data keys  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| keys | <code>Array.&lt;String&gt;</code> | keys |
| [options] | <code>Object</code> | options |
| [options.dataPath] | <code>String</code> | data path |
| callback | <code>function</code> | callback (error, data) |

**Example**  
```js
const storage = require('electron-json-storage');

storage.getMany([ 'foobar', 'barbaz' ], function(error, data) {
  if (error) throw error;

  console.log(data.foobar);
  console.log(data.barbaz);
});
```
<a name="module_storage.getAll"></a>

### storage.getAll([options], callback)
This function returns an empty object if there is no data to be read.

**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Read all user data  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | options |
| [options.dataPath] | <code>String</code> | data path |
| callback | <code>function</code> | callback (error, data) |

**Example**  
```js
const storage = require('electron-json-storage');

storage.getAll(function(error, data) {
  if (error) throw error;

  console.log(data);
});
```
<a name="module_storage.set"></a>

### storage.set(key, json, [options], callback)
**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Write user data  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | key |
| json | <code>Object</code> | json object |
| [options] | <code>Object</code> | options |
| [options.dataPath] | <code>String</code> | data path |
| callback | <code>function</code> | callback (error) |

**Example**  
```js
const storage = require('electron-json-storage');

storage.set('foobar', { foo: 'bar' }, function(error) {
  if (error) throw error;
});
```
<a name="module_storage.has"></a>

### storage.has(key, [options], callback)
**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Check if a key exists  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | key |
| [options] | <code>Object</code> | options |
| [options.dataPath] | <code>String</code> | data path |
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

### storage.keys([options], callback)
**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Get the list of saved keys  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | options |
| [options.dataPath] | <code>String</code> | data path |
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

### storage.remove(key, [options], callback)
Notice this function does nothing, nor throws any error
if the key doesn't exist.

**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Remove a key  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | key |
| [options] | <code>Object</code> | options |
| [options.dataPath] | <code>String</code> | data path |
| callback | <code>function</code> | callback (error) |

**Example**  
```js
const storage = require('electron-json-storage');

storage.remove('foobar', function(error) {
  if (error) throw error;
});
```
<a name="module_storage.clear"></a>

### storage.clear([options], callback)
**Kind**: static method of <code>[storage](#module_storage)</code>  
**Summary**: Clear all stored data in the current user data path  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | options |
| [options.dataPath] | <code>String</code> | data path |
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

If you're having any problem, please [raise an issue](https://github.com/electron-userland/electron-json-storage/issues/new) on GitHub and we'll be happy to help.

Tests
-----

Run the test suite by doing:

```sh
$ npm test
```

Contribute
----------

- Issue Tracker: [github.com/electron-userland/electron-json-storage/issues](https://github.com/electron-userland/electron-json-storage/issues)
- Source Code: [github.com/electron-userland/electron-json-storage](https://github.com/electron-userland/electron-json-storage)

Before submitting a PR, please make sure that you include tests, and that [jshint](http://jshint.com) runs without any warning:

```sh
$ npm run-script lint
```

License
-------

The project is licensed under the MIT license.
