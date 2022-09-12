#!/bin/sh

set -o errexit
set -o nounset

HASH="$(git rev-parse HEAD)"
VENDORPULL_REPOSITORY="https://github.com/jviotti/vendorpull"
TEMPORARY_DIRECTORY="$(mktemp -d -t vendorpull-test-XXXXX)"
git -C "$TEMPORARY_DIRECTORY" init

echo "Setting up test case at $TEMPORARY_DIRECTORY..."
temporary_directory_clean() {
  rm -rf "$TEMPORARY_DIRECTORY"
}

trap temporary_directory_clean EXIT

VENDORPULL_SOURCE="$PWD"
cd "$TEMPORARY_DIRECTORY"

echo "Setting up vendorpull..."
mkdir -p "$TEMPORARY_DIRECTORY/vendor"
cp -rf "$VENDORPULL_SOURCE" "$TEMPORARY_DIRECTORY/vendor/vendorpull"
rm -rf "$TEMPORARY_DIRECTORY/vendor/vendorpull/.git"

echo "Creating DEPENDENCIES files..."
echo "vendorpull $VENDORPULL_REPOSITORY $HASH" > "$TEMPORARY_DIRECTORY/DEPENDENCIES"

echo "Running assertions..."

if [ ! -d "$TEMPORARY_DIRECTORY/vendor/vendorpull/test" ]
then
  echo "The test directory in vendorpull should exist"
  exit 1
fi

echo "test" > "$TEMPORARY_DIRECTORY/vendor/vendorpull.mask"

./vendor/vendorpull/pull

if [ -d "$TEMPORARY_DIRECTORY/vendor/vendorpull/test" ]
then
  echo "The test directory in vendorpull should not exist"
  exit 1
fi

echo "PASS"
