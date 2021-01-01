#!/bin/bash
if ! [ -d "$ZERO_DEV_OS/tools/html-js/node_modules" ]; then
  cd $ZERO_DEV_OS/tools/html-js
  npm install &> /dev/null
  > /dev/null cd -
fi

node $ZERO_DEV_OS/tools/html-js/index.js $*
