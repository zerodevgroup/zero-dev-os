#!/bin/bash
if ! [ -d "/opt/zero-dev-os/tools/timestamp/node_modules" ]; then
  cd /opt/zero-dev-os/tools/timestamp
  npm install
  cd -
fi

node /opt/zero-dev-os/tools/timestamp/index.js $*

