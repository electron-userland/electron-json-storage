# Mask a directory with a set of patterns
# @params [string] Input directory
# @params [string] Mask file
vendorpull_mask_directory() {
  if [ -f "$2" ]
  then
    while read -r pattern
    do
      echo "Applying mask on $1: $pattern" 1>&2
      rm -vrf "${1:?}/${pattern:?}"
    done < "$2"
  fi
}
