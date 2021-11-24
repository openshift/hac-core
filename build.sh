#!/bin/bash
set -exuo pipefail

pushd frontend
yarn install
yarn build
popd
