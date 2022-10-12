# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [4.6.0] - 2022-10-12

- Add a `.setSync()` function

## [4.5.0] - 2021-04-13

- Add a `.getSync()` function

## [4.4.0] - 2021-02-22

- Gracefully require the user to call `.setDataPath()` if the `remote` module
  is not available when running on a renderer process

## [4.3.0] - 2020-11-04

- Add a `prettyPrinting` option to `.set()`

## [4.2.0] - 2020-07-09

- Support a `validate` boolean option in `.set()` to validate writes by reading
  the key back after a short period of time and re-trying the write if the
  contents do not match

## [4.1.8] - 2019-09-13

- Don't list non-JSON files in `.keys()`

## [4.1.7] - 2019-08-12

- Don't store data as UTF-8

## [4.1.6] - 2019-01-26

- Implement atomic writes

## [4.1.5] - 2018-12-02

- Retry on `EPERM` when locking and reading

## [4.1.4] - 2018-10-09

### Changed

- Set `electron` as a `devDependency`

## [4.1.3] - 2018-10-01

### Changed

- Retry lock release if OS reports `EPERM`

## [4.1.2] - 2018-08-26

### Changed

- Set `electron` as a `peerDependency`

## [4.1.1] - 2018-07-11

### Changed

- Ensure parallel writes from multiple processes don't corrupt data

## [4.1.0] - 2018-04-15

### Changed

- Support spaces in keys

## [4.0.3] - 2018-04-07

### Changed

- Remove unnecessary ES6 features from the code base to keep it ES5

## [4.0.2] - 2017-10-20

### Changed

- Ensure the `options` argument always defaults to an empty object.

## [4.0.1] - 2017-10-19

### Changed

- Don't throw if the user doesn't pass a callback function.

## [4.0.0] - 2017-10-18

### Changed

- React to external changes to the `userData` path.
- Replace `storage.DEFAULT_DATA_PATH` with `storage.getDefaultDataPath()`.

## [3.2.0] - 2017-10-07

### Added

- Add `dataPath` options to every function.

## [3.1.1] - 2017-09-27

### Changed

- Replace asterisks with hyphens in file names to avoid Windows path problems.

## [3.1.0] - 2017-08-29

### Added

- Support storing values in a custom directory.

## [3.0.7] - 2017-07-27

### Changed

- Decode URI encoded file names on `.keys()`

## [3.0.6] - 2017-06-29

### Changed

- Ensure parallel writes don't corrupt the data.

## [3.0.5] - 2017-04-14

### Changed

- Make the module work on Spectron tests.

## [3.0.4] - 2017-03-30

### Changed

- Get rid of `exists-file`, which is known to cause UglifyJS issues.

## [3.0.3] - 2017-03-30

### Changed

- Remove ES6 features from the codebase.

## [3.0.2] - 2017-03-24

### Changed

- Ignore `.DS_Store` in settings directory
- Include the invalid error object on "invalid data" errors

## [3.0.1] - 2017-01-30

### Changed

- Don't throw `ENOENT` on `.getAll()` if the user data path directory doesn't exist.

## [3.0.0] - 2017-01-08

### Changed

- Store settings inside a `storage/` directory inside `userPath`.

## [2.1.1] - 2017-01-08

### Changed

- Don't throw `ENOENT` on `.set()` if `userPath` doesn't exist.

## [2.1.0] - 2016-11-13

### Added

- Implement `.getAll()`.
- Implement `.getMany()`.

## [2.0.3] - 2016-10-27

### Changed

- Change `let` to `var` for compatibility purposes.

## [2.0.2] - 2016-10-24

### Changed

- Fix "Callback has already been called" error in `.get()`.

## [2.0.1] - 2016-10-05

### Changed

- Prevent errors when using reserved characters in keys in Windows.

## [2.0.0] - 2016-02-26

### Changed

- Ignore `GPUCache` key, saved by Electron.

### Removed

- Remove promises support.

## [1.1.0] - 2016-02-17

### Added

- Implement `.keys() function`.

### Changed

- Fix error when requiring this module from the renderer process.

[4.6.0]: https://github.com/electron-userland/electron-json-storage/compare/v4.5.0...v4.6.0
[4.5.0]: https://github.com/electron-userland/electron-json-storage/compare/v4.4.0...v4.5.0
[4.4.0]: https://github.com/electron-userland/electron-json-storage/compare/v4.3.0...v4.4.0
[4.3.0]: https://github.com/electron-userland/electron-json-storage/compare/v4.2.0...v4.3.0
[4.2.0]: https://github.com/electron-userland/electron-json-storage/compare/v4.1.8...v4.2.0
[4.1.8]: https://github.com/electron-userland/electron-json-storage/compare/v4.1.7...v4.1.8
[4.1.7]: https://github.com/electron-userland/electron-json-storage/compare/v4.1.6...v4.1.7
[4.1.6]: https://github.com/electron-userland/electron-json-storage/compare/v4.1.5...v4.1.6
[4.1.5]: https://github.com/electron-userland/electron-json-storage/compare/v4.1.4...v4.1.5
[4.1.4]: https://github.com/electron-userland/electron-json-storage/compare/v4.1.3...v4.1.4
[4.1.3]: https://github.com/electron-userland/electron-json-storage/compare/v4.1.2...v4.1.3
[4.1.2]: https://github.com/electron-userland/electron-json-storage/compare/v4.1.1...v4.1.2
[4.1.1]: https://github.com/electron-userland/electron-json-storage/compare/v4.1.0...v4.1.1
[4.1.0]: https://github.com/electron-userland/electron-json-storage/compare/v4.0.3...v4.1.0
[4.0.3]: https://github.com/electron-userland/electron-json-storage/compare/v4.0.2...v4.0.3
[4.0.2]: https://github.com/electron-userland/electron-json-storage/compare/v4.0.1...v4.0.2
[4.0.1]: https://github.com/electron-userland/electron-json-storage/compare/v4.0.0...v4.0.1
[4.0.0]: https://github.com/electron-userland/electron-json-storage/compare/v3.2.0...v4.0.0
[3.2.0]: https://github.com/electron-userland/electron-json-storage/compare/v3.1.1...v3.2.0
[3.1.1]: https://github.com/electron-userland/electron-json-storage/compare/v3.1.0...v3.1.1
[3.1.0]: https://github.com/electron-userland/electron-json-storage/compare/v3.0.7...v3.1.0
[3.0.7]: https://github.com/electron-userland/electron-json-storage/compare/v3.0.6...v3.0.7
[3.0.6]: https://github.com/electron-userland/electron-json-storage/compare/v3.0.5...v3.0.6
[3.0.5]: https://github.com/electron-userland/electron-json-storage/compare/v3.0.4...v3.0.5
[3.0.4]: https://github.com/electron-userland/electron-json-storage/compare/v3.0.3...v3.0.4
[3.0.3]: https://github.com/electron-userland/electron-json-storage/compare/v3.0.2...v3.0.3
[3.0.2]: https://github.com/electron-userland/electron-json-storage/compare/v3.0.1...v3.0.2
[3.0.1]: https://github.com/electron-userland/electron-json-storage/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/electron-userland/electron-json-storage/compare/v2.1.1...v3.0.0
[2.1.1]: https://github.com/electron-userland/electron-json-storage/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/electron-userland/electron-json-storage/compare/v2.0.3...v2.1.0
[2.0.3]: https://github.com/electron-userland/electron-json-storage/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/electron-userland/electron-json-storage/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/electron-userland/electron-json-storage/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/electron-userland/electron-json-storage/compare/v1.1.0...v2.0.0
[1.1.0]: https://github.com/electron-userland/electron-json-storage/compare/v1.0.0...v1.1.0
