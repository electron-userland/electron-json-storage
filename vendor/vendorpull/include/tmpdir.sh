TEMPORARY_DIRECTORY="$(mktemp -d -t vendorpull-clone-XXXXX)"
echo "Setting up temporary directory at $TEMPORARY_DIRECTORY..."
temporary_directory_clean() {
  rm -rf "$TEMPORARY_DIRECTORY"
}
trap temporary_directory_clean EXIT
