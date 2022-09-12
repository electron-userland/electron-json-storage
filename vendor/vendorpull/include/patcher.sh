# Apply a set of patches to a base directory
# @params [string] Base directory
# @params [string] Patches directory
vendorpull_patch() {
  if [ -d "$2" ]
  then
    for patch in "$2"/*.patch
    do
      echo "Applying patch $patch..."
      vendorpull_patch_git "$1" "$patch"
    done
  fi
}
