#!/bin/bash
if ! [ -d "/opt/zero-dev-os/tools/generate-uuid/node_modules" ]; then
  cd /opt/zero-dev-os/tools/generate-uuid
  npm install
  cd -
fi

if [ "$#" -lt 3 ]; then
  node /opt/zero-dev-os/tools/generate-uuid/index.js $* --help
  exit -1
fi

node /opt/zero-dev-os/tools/generate-uuid/index.js $*

