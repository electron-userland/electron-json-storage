#!/bin/sh

set -o errexit
set -o nounset

TEMPORARY_DIRECTORY="$(mktemp -d -t vendorpull-test-XXXXX)"

echo "Setting up test case at $TEMPORARY_DIRECTORY..."
temporary_directory_clean() {
  rm -rf "$TEMPORARY_DIRECTORY"
}

trap temporary_directory_clean EXIT

VENDORPULL_SOURCE="$PWD"
cd "$TEMPORARY_DIRECTORY"

echo "Running bootstrap script..."
set +e
"$VENDORPULL_SOURCE/bootstrap"
EXIT_CODE="$?"
set -e

if [ "$EXIT_CODE" = "0" ]
then
  echo "The boostrap script should fail on a non-git repo"
  exit 1
fi

echo "PASS"
