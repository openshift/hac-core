#!/bin/bash
set -exuo pipefail

export IS_PR=${IS_PR:-false}

pushd frontend
yarn install

# let's turn on universal build
if [ "$IS_PR" == true ]; then
  yarn build
else
  export BETA=false
  yarn build
  mv dist stable
  export BETA=true
  yarn build
  mv dist preview
  mkdir -p dist
  mv stable dist/stable
  mv preview dist/preview
fi

popd
