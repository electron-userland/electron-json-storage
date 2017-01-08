# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

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

[3.0.0]: https://github.com/jviotti/electron-json-storage/compare/v2.1.1...v3.0.0
[2.1.1]: https://github.com/jviotti/electron-json-storage/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/jviotti/electron-json-storage/compare/v2.0.3...v2.1.0
[2.0.3]: https://github.com/jviotti/electron-json-storage/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/jviotti/electron-json-storage/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/jviotti/electron-json-storage/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/jviotti/electron-json-storage/compare/v1.1.0...v2.0.0
[1.1.0]: https://github.com/jviotti/electron-json-storage/compare/v1.0.0...v1.1.0
