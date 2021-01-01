#!/bin/bash

DIRECTORY=$1
COMMAND=$2

while inotifywait -e modify -r $DIRECTORY; do
  $COMMAND
done
