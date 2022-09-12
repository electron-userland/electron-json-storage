#!/bin/sh

set -o errexit
REVISION="$VENDORPULL_REVISION"
set -o nounset

%include "assert.sh"
%include "dependencies.sh"
%include "vcs/git.sh"

vendorpull_assert_command 'git'

# Get the root directory of the current git repository
INSTALLATION_DIRECTORY="$(git rev-parse --show-toplevel)"

DEPENDENCIES_FILE="$INSTALLATION_DIRECTORY/DEPENDENCIES"

# The repository to install from.
# TODO: We should find a way to make this resistant to repository renames, etc.
VENDORPULL_REPOSITORY="https://github.com/jviotti/vendorpull"

%include "tmpdir.sh"

# Clone the latest available version of vendorpull to perform
# the initial dependencies installation
echo "Cloning vendorpull..."
vendorpull_clone_git "$VENDORPULL_REPOSITORY" "$TEMPORARY_DIRECTORY" HEAD

if [ -n "$REVISION" ]
then
  # We use this for testing purposes, as otherwise we cannot
  # send a pull-request and have the changes to the program
  # be taken into account by the bootstrap script.
  echo "Using input revision $REVISION"
  HASH="$REVISION"
else
  HASH="$(git -C "$TEMPORARY_DIRECTORY" rev-parse HEAD)"
fi

# Make sure we use the same vendorpull version that we are about
# to install in order to not cause unpredictable results.
git -C "$TEMPORARY_DIRECTORY" checkout "$HASH"

echo "Creating DEPENDENCIES files..."
vendorpull_dependency_set "$DEPENDENCIES_FILE" vendorpull "$VENDORPULL_REPOSITORY" "$HASH"

# After vendorpull has been declared in the repo, run a full update
echo "Pulling dependencies ..."
cd "$INSTALLATION_DIRECTORY"
"$TEMPORARY_DIRECTORY/pull"

echo "Done!"
