#!/bin/bash
if ! [ -d "/opt/zero-dev-os/tools/generate-uuid/node_modules" ]; then
  cd /opt/zero-dev-os/tools/generate-uuid
  npm install
  cd -
fi

node /opt/zero-dev-os/tools/generate-uuid/index.js $*

