#!/bin/sh

set -o errexit
PATTERN="$1"
set -o nounset

%include "assert.sh"
%include "tmpdir.sh"
%include "vcs/git.sh"
%include "vcs/http.sh"
%include "masker.sh"
%include "patcher.sh"
%include "dependencies.sh"

# @params [string] Base directory
# @params [string] Dependency definition
vendorpull_command_pull() {
  NAME="$(vendorpull_dependencies_name "$2")"
  URL="$(vendorpull_dependencies_repository "$2")"
  REVISION="$(vendorpull_dependencies_revision "$2")"

  echo "Updating $NAME..."
  DOWNLOAD_LOCATION="$TEMPORARY_DIRECTORY/$NAME"

  if vendorpull_is_git "$URL"
  then
    vendorpull_clone_git "$URL" "$DOWNLOAD_LOCATION" "$REVISION"
    vendorpull_patch "$DOWNLOAD_LOCATION" "$1/patches/$NAME"
    vendorpull_clean_git "$DOWNLOAD_LOCATION"
    vendorpull_mask_directory "$DOWNLOAD_LOCATION" "$1/vendor/$NAME.mask"
  else
    vendorpull_clone_http "$URL" "$DOWNLOAD_LOCATION"
    vendorpull_clone_checksum "$DOWNLOAD_LOCATION" "$REVISION"
  fi

  # Atomically move the new dependency into the vendor directory
  OUTPUT_DIRECTORY="$1/vendor/$NAME"
  rm -rf "$OUTPUT_DIRECTORY"
  mkdir -p "$(dirname "$OUTPUT_DIRECTORY")"
  mv "$DOWNLOAD_LOCATION" "$OUTPUT_DIRECTORY"
}

vendorpull_assert_command 'git'

# Get the root directory of the current git repository
BASE_DIRECTORY="$(git rev-parse --show-toplevel)"
DEPENDENCIES_FILE="$BASE_DIRECTORY/DEPENDENCIES"
vendorpull_assert_file "$DEPENDENCIES_FILE"

if [ -n "$PATTERN" ]
then
  DEFINITION="$(vendorpull_dependencies_safe_find "$DEPENDENCIES_FILE" "$PATTERN")"
  vendorpull_command_pull "$BASE_DIRECTORY" "$DEFINITION"
else
  echo "Reading DEPENDENCIES files..."
  while read -r dependency
  do
    vendorpull_command_pull "$BASE_DIRECTORY" "$dependency"
  done < "$DEPENDENCIES_FILE"
fi
