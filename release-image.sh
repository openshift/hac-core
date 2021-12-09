#!/usr/bin/env bash
set -e
set -x

pushd frontend

# Prepare env variables needed in future by release script
export TRAVIS_BRANCH=`git rev-parse --abbrev-ref HEAD`
export APP_ROOT=$PWD/dist
export SRC_HASH=`git rev-parse --verify HEAD`
export GIT_BRANCH=`git rev-parse --abbrev-ref HEAD`
export APP_NAME=`node -e 'console.log(require("./package.json").imagename || require("./package.json").insights.appname)'`

# Scipts folder holds scripts from frontend-common-builder
mkdir -p ./scripts
curl -sSL https://raw.githubusercontent.com/RedHatInsights/insights-frontend-builder-common/master/src/nginx_conf_gen.sh > ./scripts/nginx_conf_gen.sh
curl -sSL https://raw.githubusercontent.com/RedHatInsights/insights-frontend-builder-common/master/src/quay_push.sh > ./scripts/quay_push.sh
chmod +x -R ./scripts/

# This script will generate nginx and Dockerfile, unless they are already created
./scripts/nginx_conf_gen.sh
cd $APP_ROOT
docker build . -t ${APP_NAME}

docker tag ${APP_NAME} quay.io/redhat-cloud-services/${APP_NAME}

docker tag ${APP_NAME} quay.io/redhat-cloud-services/${APP_NAME}:${SRC_HASH}

docker tag ${APP_NAME} quay.io/redhat-cloud-services/${APP_NAME}:${GIT_BRANCH}

echo $DOCKER_TOKEN | docker login quay.io --username \$oauthtoken --password-stdin

docker push quay.io/redhat-cloud-services/${APP_NAME}
docker push quay.io/redhat-cloud-services/${APP_NAME}:${SRC_HASH}
docker push quay.io/redhat-cloud-services/${APP_NAME}:${GIT_BRANCH}
popd
