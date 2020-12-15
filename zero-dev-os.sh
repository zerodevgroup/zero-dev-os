#!/bin/bash

if [ "$EUID" -ne 0 ]
  then 
    echo ""
    echo "Try again with sudo. :)"
    echo ""
  exit
fi

ZERO_DEV_OS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

if ! [ -d "$ZERO_DEV_OS_DIR/cli/node_modules" ]; then
  cd $ZERO_DEV_OS_DIR/cli
  npm install
  cd -
fi

node $ZERO_DEV_OS_DIR/cli/index.js $*

echo ""
