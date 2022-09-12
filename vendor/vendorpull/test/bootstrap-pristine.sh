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

echo "Running bootstrap script..."
"$VENDORPULL_SOURCE/bootstrap"

echo "Running assertions..."

if [ ! -f "$TEMPORARY_DIRECTORY/DEPENDENCIES" ]
then
  echo "The bootstrap script should have created a DEPENDENCIES file" 1>&2
  exit 1
fi

if [ ! -d "$TEMPORARY_DIRECTORY/vendor" ]
then
  echo "The bootstrap script should have created a vendor directory" 1>&2
  exit 1
fi

if [ ! -d "$TEMPORARY_DIRECTORY/vendor/vendorpull" ]
then
  echo "The bootstrap script should have created a vendor/vendorpull directory" 1>&2
  exit 1
fi

if [ ! -x "$TEMPORARY_DIRECTORY/vendor/vendorpull/pull" ]
then
  echo "There should be an pull executable file at vendor/vendorpull" 1>&2
  exit 1
fi

echo "PASS"
