#!/bin/bash
if ! [ -d "$ZERO_DEV_OS/tools/ip-address/node_modules" ]; then
  cd $ZERO_DEV_OS/tools/ip-address
  npm install &> /dev/null
  > /dev/null cd -
fi

node $ZERO_DEV_OS/tools/ip-address/index.js $*
