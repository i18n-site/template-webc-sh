#!/usr/bin/env bash

path_to_add="$(dirname $(realpath ${BASH_SOURCE[0]}))/node_modules/.bin"
if [[ ":$PATH:" != *":$path_to_add:"* ]]; then
  export PATH="$path_to_add:$PATH"
fi
