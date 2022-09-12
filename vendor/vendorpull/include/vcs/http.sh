# Download a file over HTTP
# @params [string] HTTP URL
# @params [string] Download location
vendorpull_clone_http() {
  curl --location --retry 5 --output "$2" "$1"
}

# Validate a file against its MD5 checksum
# @params [string] File path
# @params [string] MD5 hash
vendorpull_clone_checksum() {
  md5sum "$1"
  NAME="$(basename "$1")"
  # This has to be two spaces to match md5sum(1)
  echo "$REVISION  $NAME" > "$TEMPORARY_DIRECTORY/$NAME.md5"
  cd "$(dirname "$1")"
  md5sum --check "$TEMPORARY_DIRECTORY/$NAME.md5"
  cd - > /dev/null
}
