#!/usr/bin/env bash

DIR=$(realpath $0) && DIR=${DIR%/*}
cd $DIR
set -e
. env.sh
set -x

cd ..

if [ -f "api/mod.js" ]; then
  cd api

  if [ ! -d "node_modules" ]; then
    rm -rf bun.lock
    bun i
  fi

  esbuild ./mod.js --bundle --outfile=../dist/api.js \
    --tree-shaking=true --minify=true --format=esm \
    --minify-whitespace=false --minify-identifiers=false \
    --target=esnext --platform=browser --external:"-/*" \
    $@
fi
