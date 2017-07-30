# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

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
