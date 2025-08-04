#!/usr/bin/env bash

DIR=$(realpath $0) && DIR=${DIR%/*}
cd $DIR
set -e
. env.sh
set -x
cd ..
rm -rf htm
pug -c pug -o htm
