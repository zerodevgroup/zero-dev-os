#!/bin/bash
if ! [ -d "/opt/zero-dev-os/tools/ip-address/node_modules" ]; then
  cd /opt/zero-dev-os/tools/ip-address
  npm install &> /dev/null
  > /dev/null cd -
fi

node /opt/zero-dev-os/tools/ip-address/index.js $*
