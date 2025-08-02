#!/usr/bin/env bash

DIR=$(realpath $0) && DIR=${DIR%/*/*}
cd $DIR
set -e

if ! command -v npm-check-updates &>/dev/null; then
  npm i -g npm-check-updates
fi

find . -name "package.json" -not -path "*/node_modules/*" -print0 | while IFS= read -r -d '' pkg_file; do
  # 获取 package.json 所在的目录
  dir=$(dirname "$pkg_file")
  # 使用子 shell (...) 来执行命令，这样不会改变当前脚本的工作目录
  (
    cd "$dir" && echo "$(pwd)" && ncu -u && rm -f bun.lock && bun i
  )
done
