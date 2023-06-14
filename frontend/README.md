# hac-core frontend

Formerly [hac-core-frontend](https://github.com/RedHatInsights/hac-core-frontend).

## Starting Proxy Service

Make sure you have the latest dependencies by running `yarn install`.

To start up the app in a proxy mode to ConsoleDot, you can just execute the primary one with `yarn dev`. It will run the app on stage environment https://stage.foo.redhat.com:1337/beta/hac. You should search `How to configure the browser proxy settings for internal Red Hat usage` on https://help.redhat.com/ to get access to internal stage env. If you don't have access to RH's VPN please run the app in prod mode `ENVIRONMENT=prod yarn dev`. You will probably need to run [cloud-services-config](https://github.com/RedHatInsights/cloud-services-config#testing-your-changes-locally) as well. So the full command would be `ENVIRONMENT=prod CONFIG_PORT=8889 yarn dev`.

Alternatively you can pick from one of the start scripts in the [package.json](package.json).


### ENV variables

* `LOCAL_HAC_DEV=true` if you want to run hac-core with hac-dev application locally
* `LOCAL_HAC_INFRA=true` if you want to run hac-core with hac-infra application locally
* `BETA=true` if you want to run hac-core app on beta environment
* `ENVIRONMENT=stage|prod` choose which environment you want hac-core to run on
* `REMOTE_CONFIG=stage|prod` choose from which environment you want to pull navigation connfig
* `CONFIG_PORT=8889` port over which https://github.com/RedHatInsights/cloud-services-config is running
* `INSIGHTS_CHROME=/home/example/git/RedHatInsights/insights-chrome/build` to point where your chrome is being build, in cases when you need to test chrome functions locally

