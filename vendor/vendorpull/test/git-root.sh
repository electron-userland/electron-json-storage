#!/bin/sh

set -o errexit
set -o nounset

TEMPORARY_DIRECTORY="$(mktemp -d -t vendorpull-test-XXXXX)"
git -C "$TEMPORARY_DIRECTORY" init
echo "Setting up test case at $TEMPORARY_DIRECTORY..."
temporary_directory_clean() {
  rm -rf "$TEMPORARY_DIRECTORY"
}
trap temporary_directory_clean EXIT

VENDORPULL_SOURCE="$PWD"

mkdir -p "$TEMPORARY_DIRECTORY/foo/bar/baz"
cd "$TEMPORARY_DIRECTORY/foo/bar/baz"

echo "Running bootstrap script..."
"$VENDORPULL_SOURCE/bootstrap"

echo "Running assertions..."

if [ ! -f "$TEMPORARY_DIRECTORY/DEPENDENCIES" ]
then
  echo "The bootstrap script should have created a DEPENDENCIES file at the git root" 1>&2
  exit 1
fi

if [ -f "$TEMPORARY_DIRECTORY/foo/bar/baz/DEPENDENCIES" ]
then
  echo "The bootstrap script should have created a DEPENDENCIES file at the current working directory" 1>&2
  exit 1
fi

echo "PASS"
