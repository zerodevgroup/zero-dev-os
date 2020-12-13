#!/bin/bash

apt install --yes curl software-properties-common
curl -sL https://deb.nodesource.com/setup_14.x | bash -
apt-get install -y nodejs
