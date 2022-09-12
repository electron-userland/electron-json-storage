# @params [string] Error message
vendorpull_fail() {
  echo "ERROR: $1" 1>&2
  exit 1
}

# @params [string] File path
# @params [string] Error message
vendorpull_assert_defined() {
  if [ -z "$1" ]
  then
    vendorpull_fail "$2"
  fi
}

# @params [string] Command
vendorpull_assert_command() {
  if ! command -v "$1" > /dev/null
  then
    vendorpull_fail "You must install $1 in order to use this tool"
  fi
}

# @params [string] File path
vendorpull_assert_file() {
  if [ ! -f "$1" ]
  then
    vendorpull_fail "No such file: $1"
  fi
}
