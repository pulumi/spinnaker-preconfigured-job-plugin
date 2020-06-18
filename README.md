## Quick Start

### Plugins repository

Add the Pulumi plugins repository for Spinnaker by running the following command using Halyard:

```
hal plugins repository add pulumi --url https://raw.githubusercontent.com/pulumi/spinnaker-plugins-repository/master/repositories.json
```

### Plugin installation

Install this plugin by running the following command using Halyard:

> You can specify an older version number if you prefer to install an older version. See the available version numbers from https://raw.githubusercontent.com/pulumi/spinnaker-plugins-repository/master/plugins.json for this specific plugin.

```
hal plugins add Pulumi.PreConfiguredJobPlugin --enabled true --version 0.0.1 --extensions pulumi.PreConfiguredJobStage
```

## User Guide

We have put together a [guide](https://www.pulumi.com/docs/guides/continuous-delivery/spinnaker/) to walk-through how to setup and use this plugin in your Spinnaker instance. 

## Publishing A New Version

> You need to be a maintainer of this repo to be able to publish new versions to the official Pulumi plugins [repository](https://github.com/pulumi/spinnaker-plugins-repository) for Spinnaker.

See this [wiki](https://github.com/pulumi/spinnaker-preconfigured-job-plugin/wiki/Publishing-a-new-release) page for details about how to publish a new version of the plugin.
