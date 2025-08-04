#!/usr/bin/env bash

DIR=$(realpath $0) && DIR=${DIR%/*}
cd $DIR
set -ex

cd ..

if [ -d "css" ]; then
  if [ -d "css/.git" ]; then
    cd css
    git pull
    cd ..
  fi
else
  git clone -b dev --depth=1 ssh://git@ssh.github.com:443/i18n-host/css.git
fi

find . -name "package.json" -not -path "*/node_modules/*" -print0 | while IFS= read -r -d '' pkg_file; do
  # 获取 package.json 所在的目录
  dir=$(dirname "$pkg_file")
  # 使用子 shell (...) 来执行命令，这样不会改变当前脚本的工作目录
  (
    cd "$dir" && echo "$(pwd)" && rm -f bun.lock && bun i
  )
done
