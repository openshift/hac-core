# hac-core frontend

Formerly [hac-core-frontend](https://github.com/RedHatInsights/hac-core-frontend).

## Starting Proxy Service

Make sure you have the latest dependencies by running `yarn install`.

To start up the app in a proxy mode to ConsoleDot, you can just execute the primary one with `yarn dev`.

Alternatively you can pick from one of the start scripts in the [package.json](package.json).


### ENV variables

* `BETA=true` if you want to run hac-core app on beta environment
* `ENVIRONMENT=ci|qa|stage|prod` choose which environment you want hac-core to run on
* `REMOTE_CONFIG=ci|qa|stage|prod` choose from which environment you want to pull navigation connfig
* `CONFIG_PORT=8889` port over which https://github.com/RedHatInsights/cloud-services-config is running
* `INSIGHTS_CHROME=/home/example/git/RedHatInsights/insights-chrome/build` to point where your chrome is being build, in cases when you need to test chrome functions locally

