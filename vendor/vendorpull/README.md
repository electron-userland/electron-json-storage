vendorpull
==========

`vendorpull` is a simple vendoring package manager that takes care of managing
a `vendor` directory in your project.

Why would I want to vendor my dependencies?
-------------------------------------------

Many high-profile projects, such as Node.js and
[Golang](https://blog.filippo.io/most-go-tools-now-work-with-go15vendorexperiment/),
vendor their dependencies for some of the following reasons:

- Including dependencies as part of your `git` repository ensures that your
  project continues to work even if the dependencies cannot be resolved
  anymore, This happens in practice when repositories are moved between hosting
  providers, their history is re-written, or they are simply taken down

- In various types of software projects, making changes to a third party
  dependency and rapidly testing the application with the corresponding
  dependency changes requires significant acrobatics and maneuvers involving
  forking the dependency project, monkey-patching the build system to compile a
  dependency from a custom location, etc

- Strongly separating your application code from the third-party projects that
  it depends on at the code level makes developers less likely to cross that
  barrier for debugging purposes. If you depend on a third-party project, then
  you have as much responsibility over it as over your application code and
  vendoring encourages that behavior

- Some types of projects are not well-suited to a particular package manager.
  For example, Node.js projects are typically released on `npm` and Python
  projects are typically released on `pip`. However, what is the best way to
  release a software projects consisting of shell scripts or a dataset of CSV
  files? You can abuse another package manager to release them or work with
  them at the version control level using `git` submodules or a tool like
  `vendorpull`

Platform support
----------------

`vendorpull` runs in any POSIX system such as GNU/Linux, macOS, FreeBSD, etc.
Its only external dependencies are `git`, `curl` and `md5sum`. `vendorpull` can
be run in Microsoft Windows through the [Windows Subsystem for
Linux](https://docs.microsoft.com/en-us/windows/wsl/) or
[MinGW](https://sourceforge.net/projects/mingw/).

Installation
------------

Go to the root of the repository you want to setup `vendorpull` in and run the
following command:

```sh
/bin/sh -c "$(curl -fsSL https://raw.githubusercontent.com/jviotti/vendorpull/master/bootstrap -H "Cache-Control: no-cache, no-store, must-revalidate")"
```

The bootstrap script will install `vendorpull` at `vendor/vendorpull` and set
`vendorpull` as a dependency in a way such that `vendorpull` can manage itself.

Managing dependencies
---------------------

You can declare your dependencies using a simple `DEPENDENCIES` file where each
row corresponds to a repository you want to vendor in your project. For example:

```
vendorpull https://github.com/jviotti/vendorpull 6a4d9aa9d8ee295151fd4cb0ac59f30f20217a8f
depot_tools https://chromium.googlesource.com/chromium/tools/depot_tools.git 399c5918bf47ff1fe8477f27b57fa0e8c67e438d
electron https://github.com/electron/electron 68d9adb38870a6ea4f8796ba7d4d9bea2db7b7a0
```

In this case, we're vendoring `vendorpull` itself, Chromium's `depot_tools`,
and the Electron project.

- The first column defines the dependency name as it will be vendored in the
  project. The dependency is vendored inside the `vendor` directory.
- The second column defines the repository URL of the dependency
- The third column defines either the `git` revision of the project that you
  want to vendor or the MD5 hash of the file if the URL does not point to a
  `git` repository

In order to pull all dependencies, run the following command:

```sh
./vendor/vendorpull/pull
```

You can also pull a single dependency by specifying its name as the first argument. For example:

```sh
./vendor/vendorpull/pull depot_tools
```

Updating
--------

`vendorpull` is managed using `vendorpull` itself and follows the
[live-at-head](https://github.com/abseil/abseil-cpp#releases) philosophy.
Therefore you can update `vendorpull` by updating the `vendorpull` revision
from the `DEPENDENCIES` file and running the following command:

```sh
./vendor/vendorpull/pull vendorpull
```

Masking
-------

In some cases, vendoring a dependency might incur a significant space overhead
in your `git` repository. In these cases, you might want to ignore certain
paths of the vendored repository that you are not interested in, which we refer
to as *masking*.

In order to mask a dependency, you can create a file called
`vendor/<name>.mask` where `<name>` corresponds to the dependency name as
defined in the `DEPENDENCIES` file. This file contains a set of paths relative
to the dependency path that will be removed when vendoring the dependency.

For example, at the time of this writing, the Electron project repository
contains an 8.1M `docs` directory. We can ignore this directory by creating a
`vendor/electron.mask` file whose contents are the following:

```
docs
```

Masking is not available for non-`git` dependencies.

Patches
-------

Sometimes its necessary to apply a set of patches to a vendored dependency
right after pulling it into the project. You can do this automatically by
placing a set of `*.patch` files produced with
[`git-format-patch(1)`](http://schacon.github.io/git/git-format-patch.html)
into a `patches/<name>` directory where `<name>` corresponds to a dependency
name as defined in the `DEPENDENCIES` file.

Patching is not available for non-`git` dependencies.

GitHub integration
------------------

We recommend adding the following line to `.gitattributes` to [prevent
GitHub](https://docs.github.com/en/github/administering-a-repository/managing-repository-settings/customizing-how-changed-files-appear-on-github)
from automatically rendering files in `vendor` during upgrade pull requests:

```
/vendor/** linguist-generated=true
```

GNU Make integration
--------------------

Add the following directive to your `Makefile`:

```make
include vendor/vendorpull/targets.mk
```

This will add two targets:

- `vendor-pull`: Pull all dependencies
- `vendor-pull-<dependency>`: Pull a particular dependency

Future plans
------------

Here are some of the features worth exploring if you are planning to contribute
to this project:

- [ ] Native support for running on Microsoft Windows by compiling the script
  source code to either Batch or PowerShell using something like
  [Batsh](https://github.com/batsh-dev-team/Batsh)
- [ ] Gracefully support version control systems other than `git` such as
  Mercurial, SVN, and CVS

License
-------

This project is licensed under the Apache-2.0 license.
