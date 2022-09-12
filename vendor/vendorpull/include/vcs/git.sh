# Check if a URL is a git URL
# @params [string] URL
vendorpull_is_git() {
  case $1 in
    # Some heuristics
    "git@"*) return 0 ;;
    *".git") return 0 ;;
    *)
      # The brute-force approach
      git clone --depth 1 "$1" "$TEMPORARY_DIRECTORY/git-test" 2> /dev/null \\
        && EXIT_CODE="$?" || EXIT_CODE="$?"
      rm -rf "$TEMPORARY_DIRECTORY/git-test"
      test "$EXIT_CODE" != "0" && return 1
      return 0 ;;
  esac
}

# Clone a git repository
# @params [string] Git URL
# @params [string] Clone location
# @params [string] Revision
vendorpull_clone_git() {
  git clone --recurse-submodules --jobs 8 "$1" "$2"
  if [ "$3" != "HEAD" ]
  then
    git -C "$2" reset --hard "$3"
  fi
}

# Un-git the repository and its dependencies (if any)
# @params [string] Repository directory
vendorpull_clean_git() {
  GIT_FILES=".git .gitignore .github .gitmodules"
  git -C "$1" submodule foreach "rm -rf $GIT_FILES"
  for file in $GIT_FILES
  do
    rm -rf "$1/${file:?}"
  done
}

# @params [string] Repository directory
# @params [string] Patch file
vendorpull_patch_git() {
  git -C "$1" apply --3way "$2"
}
