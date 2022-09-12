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

FILE_NAME="LICENSE"
FILE_URL="https://raw.githubusercontent.com/jviotti/vendorpull/7abb0c21bb5186766af295a0dec3eae5a3a9200c/LICENSE"
FILE_MD5="86d3f3a95c324c9479bd8986968f4327"

echo "$FILE_NAME $FILE_URL $FILE_MD5" >> "$TEMPORARY_DIRECTORY/DEPENDENCIES"
./vendor/vendorpull/pull LICENSE

test -f "$TEMPORARY_DIRECTORY/vendor/LICENSE" || \
  (echo "LICENSE file was not downloaded" 1>&2 && exit 1)
