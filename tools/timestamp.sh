#!/bin/bash
if ! [ -d "$HOME/lock-alpha/tools/timestamp/node_modules" ]; then
  cd $HOME/lock-alpha/tools/timestamp
  npm install
  cd -
fi

node $HOME/lock-alpha/tools/timestamp/index.js $*

