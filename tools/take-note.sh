#!/bin/bash
if ! [ -d "/opt/zero-dev-os/tools/take-note/node_modules" ]; then
  cd /opt/zero-dev-os/tools/take-note
  npm install
  cd -
fi

node /opt/zero-dev-os/tools/take-note/index.js $*

