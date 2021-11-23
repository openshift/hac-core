#!/bin/bash
set -exuo pipefail

# TODO remove this once CI runs build script prior to test script
./build.sh

pushd frontend
npm run lint
npm run test
popd
