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

# An invalid one by design
FILE_MD5="12345678912345678912345678912345"

echo "$FILE_NAME $FILE_URL $FILE_MD5" >> "$TEMPORARY_DIRECTORY/DEPENDENCIES"
set +e
./vendor/vendorpull/pull LICENSE
EXIT_CODE="$?"
set -e

if [ "$EXIT_CODE" = "0" ]
then
  echo "The pull should fail due to the hash mismatch" 1>&2
  exit 1
fi

test ! -f "$TEMPORARY_DIRECTORY/vendor/LICENSE" || \
  (echo "LICENSE file must not be downloaded" 1>&2 && exit 1)
