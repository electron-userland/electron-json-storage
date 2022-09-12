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
cd "$TEMPORARY_DIRECTORY"

echo "Running bootstrap script multiple times..."
"$VENDORPULL_SOURCE/bootstrap"
"$VENDORPULL_SOURCE/bootstrap"
"$VENDORPULL_SOURCE/bootstrap"
"$VENDORPULL_SOURCE/bootstrap"

if [ ! -f "$TEMPORARY_DIRECTORY/DEPENDENCIES" ]
then
  echo "The bootstrap script should have created a DEPENDENCIES file" 1>&2
  exit 1
fi

LINES="$(wc -l < "$TEMPORARY_DIRECTORY/DEPENDENCIES" | xargs)"

if [ "$LINES" != "1" ]
then
  echo "There should be a single entry in the DEPENDENCIES file"
  cat "$TEMPORARY_DIRECTORY/DEPENDENCIES"
  exit 1
fi

# Do a pull just to make sure it all works
./vendor/vendorpull/pull

echo "PASS"
