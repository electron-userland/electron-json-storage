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

# Replace DEPENDENCIES file
echo "lodash https://github.com/lodash/lodash 2da024c3b4f9947a48517639de7560457cd4ec6c" > "$TEMPORARY_DIRECTORY/DEPENDENCIES"
echo "vendorpull foo/bar/baz XXXXXX" >> "$TEMPORARY_DIRECTORY/DEPENDENCIES"
echo "flutter https://github.com/flutter/flutter 640ba2a76f3241fad0056b41f29cbddd74522606" >> "$TEMPORARY_DIRECTORY/DEPENDENCIES"

echo "Running bootstrap script again..."
"$VENDORPULL_SOURCE/bootstrap"

LINES="$(wc -l < "$TEMPORARY_DIRECTORY/DEPENDENCIES" | xargs)"
if [ "$LINES" != "3" ]
then
  echo "There should be a three entries in the DEPENDENCIES file"
  cat "$TEMPORARY_DIRECTORY/DEPENDENCIES"
  exit 1
fi

FIRST_LINE="$(sed '1q;d' < "$TEMPORARY_DIRECTORY/DEPENDENCIES")"
SECOND_LINE="$(sed '2q;d' < "$TEMPORARY_DIRECTORY/DEPENDENCIES")"
THIRD_LINE="$(sed '3q;d' < "$TEMPORARY_DIRECTORY/DEPENDENCIES")"

if [ "$FIRST_LINE" != "lodash https://github.com/lodash/lodash 2da024c3b4f9947a48517639de7560457cd4ec6c" ]
then
  echo "The first line does not match"
  exit 1
fi

if [ "$SECOND_LINE" != "vendorpull https://github.com/jviotti/vendorpull $VENDORPULL_REVISION" ]
then
  echo "The vendorpull entry was not updated"
  exit 1
fi

if [ "$THIRD_LINE" != "flutter https://github.com/flutter/flutter 640ba2a76f3241fad0056b41f29cbddd74522606" ]
then
  echo "The third line does not match"
  exit 1
fi

# Do a pull just to make sure it all works
echo "Pulling vendorpull..."
./vendor/vendorpull/pull vendorpull

echo "PASS"
