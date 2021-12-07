
#!/usr/bin/env bash
set -e
set -x

pushd frontend
export COMMIT_AUTHOR_USERNAME="Openshift CI"
export COMMIT_AUTHOR_EMAIL="openshift@redhat.com"
export TRAVIS_BRANCH=`git rev-parse --abbrev-ref HEAD`
export TRAVIS_BUILD_NUMBER=""
export TRAVIS_COMMIT_MESSAGE=`git log -1 --pretty=format:"%s"`
export REPO=`node -e 'console.log(require("./package.json").insights.buildrepo)'`

mkdir -p ./scripts
mkdir -p ./.travis
curl -sSL https://raw.githubusercontent.com/RedHatInsights/insights-frontend-builder-common/master/src/release.sh > ./scripts/release.sh
curl -sSL https://raw.githubusercontent.com/RedHatInsights/insights-frontend-builder-common/master/src/Jenkinsfile > ./.travis/58231b16fdee45a03a4ee3cf94a9f2c3
chmod +x -R ./scripts/

if [[ "${TRAVIS_BRANCH}" = "master" || "${TRAVIS_BRANCH}" = "main" ]]
then
    for env in ci qa stage
    do
        echo "PUSHING ${env}-beta"
        rm -rf ./dist/.git
        ./scripts/release.sh "${env}-beta"
    done
fi

if [ "${TRAVIS_BRANCH}" = "stable" ]
then
    for env in ci qa stage
    do
        echo "PUSHING ${env}-stable"
        rm -rf ./dist/.git
        ./scripts/release.sh "${env}-stable"
    done
fi

if [[ "${TRAVIS_BRANCH}" = "prod-beta" || "${TRAVIS_BRANCH}" = "prod-stable" ]]; then
    echo "PUSHING ${TRAVIS_BRANCH}"
    rm -rf ./build/.git
    ./scripts/release.sh "${TRAVIS_BRANCH}"
fi

popd
