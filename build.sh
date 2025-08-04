#!/usr/bin/env bash

DIR=$(realpath $0) && DIR=${DIR%/*}
cd $DIR
set -e
. env.sh
set -x

cd ..
rm -rf dist

./css/svg.sh

cd com
bun x vite build
cd ..

cep() {
  rm -rf dist/$1
  bun x cep -c $1 -o dist/$1
}

cep dom
cep lib

cd $DIR
./buildHtm.sh
./dom.js
./api.sh

if [ "$NODE_ENV" == "production" ]; then
  ./minifyCss.js
fi

if [ "$NODE_ENV" == "production" ]; then
  ./minifyJs.js
fi
