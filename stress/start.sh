#!/bin/sh

set -e

./node_modules/.bin/electron stress/process.js xxx & PID1=$!
./node_modules/.bin/electron stress/process.js xxxxxx & PID2=$!
wait $PID1
wait $PID2
