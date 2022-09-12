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

echo "Installing vendorpull..."
mkdir "$TEMPORARY_DIRECTORY/vendor"
cp -rf "$VENDORPULL_SOURCE" "$TEMPORARY_DIRECTORY/vendor/vendorpull"
rm -rf "$TEMPORARY_DIRECTORY/vendor/vendorpull/.git"

echo "Running assertions..."

if [ "$(head -n 1 "$TEMPORARY_DIRECTORY/vendor/vendorpull/bootstrap")" != "#!/bin/sh" ]
then
  echo "Initial expectation does not match" 1>&2
  exit 1
fi

echo "Copying test patch..."
mkdir -p "$TEMPORARY_DIRECTORY/patches/vendorpull"
cp -v "$VENDORPULL_SOURCE/test/data/0001-Change-bootstrap-to-use-bin-bash.patch" \
  "$TEMPORARY_DIRECTORY/patches/vendorpull"

echo "Creating DEPENDENCIES files..."
echo "vendorpull $VENDORPULL_REPOSITORY $HASH" > "$TEMPORARY_DIRECTORY/DEPENDENCIES"

echo "Re-running vendorpull..."
./vendor/vendorpull/pull

if [ "$(head -n 1 "$TEMPORARY_DIRECTORY/vendor/vendorpull/bootstrap")" != "#!/bin/bash" ]
then
  echo "The patch did not apply correctly" 1>&2
  exit 1
fi

echo "PASS"
