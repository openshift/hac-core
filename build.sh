#!/bin/bash
set -exuo pipefail

pushd frontend
npm install
npm run build
popd
