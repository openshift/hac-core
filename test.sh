#!/bin/bash
set -exuo pipefail

# TODO remove this once CI runs build script prior to test script
./build.sh

pushd frontend
yarn lint
yarn test
popd

# Upload code coverage
./prow-codecov.sh
