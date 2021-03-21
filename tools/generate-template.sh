#!/bin/bash
if ! [ -d "/opt/zero-dev-os/tools/generate-template/node_modules" ]; then
  cd /opt/zero-dev-os/tools/generate-template
  npm install
  cd -
fi

if [ "$#" -lt 3 ]; then
  node /opt/zero-dev-os/tools/generate-template/index.js $* --help
  exit -1
fi

node /opt/zero-dev-os/tools/generate-template/index.js $*

