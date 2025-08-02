#!/usr/bin/env bash

DIR=$(realpath $0) && DIR=${DIR%/*}
cd $DIR
set -e
. env.sh
set -x

NODE_ENV=production ./build.sh
cd ../htm
minhtm
mv * ../dist/
cd ..

bun x mdt .

git add .
git commit -m. || true

bun x bumpp patch -y

cp README.md package.json dist/

cd dist/

bun -e "fs.writeFileSync('package.json', JSON.stringify((d => {delete d.devDependencies; delete d.dependencies; delete d.browserslist; return d;})(JSON.parse(fs.readFileSync('package.json')))))"

../upload.sh

#npm publish --access public
