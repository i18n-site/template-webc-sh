#!/usr/bin/env bash

DIR=$(realpath $0) && DIR=${DIR%/*}
cd $DIR
set -ex

if [ ! -d "node_modules" ]; then
  ./init.sh
fi

. pid.sh
. env.sh
cd ..
./docker/up.sh -d

bunc="bun x pug -c pug -o htm"

case $(uname -s) in
Darwin*)
  $bunc
  nginx_url=127.0.0.1:7777
  bash -c "./sh/wait-for-it.sh $nginx_url -t 999 && open https://$nginx_url" &
  ;;
esac

name=$(basename $DIR)

onexit() {
  docker compose -p $name down
}

trap onexit EXIT

bun x conc --raw \
  "docker compose -p $name logs -f" \
  "bun x nodemon -w css/svg -e svg -x css/svg.sh" \
  "$bunc -w" \
  "bun x cep -c dom -o dist/dom -w -r sh/dom.js" \
  "bun x cep -c lib -o dist/lib -w" \
  "./sh/api.sh --watch" \
  "cd com && bun x vite build --watch"
