This plugin allows you to run Pulumi apps as jobs in your Spinnaker instance. 

## Version Compatibility

| Plugin  | Spinnaker Platform |
|:----------- | :--------- |
| 0.1.x  |  1.19.x - 1.22.x |
| 0.2.x  | 1.23.x |

## Installation

### Add the Pulumi Spinnaker plugins repository

Add the Pulumi plugins repository for Spinnaker by running the following command using Halyard:

```
hal plugins repository add pulumi --url https://raw.githubusercontent.com/pulumi/spinnaker-plugins-repository/master/repositories.json
```

### Add the Orca plugin

Install this plugin by running the following command using Halyard:

> You can specify an older version number if you prefer to install an older version. See the available version numbers from https://raw.githubusercontent.com/pulumi/spinnaker-plugins-repository/master/plugins.json for this specific plugin.

```
hal plugins add Pulumi.PreConfiguredJobPlugin --enabled true --version <version> --extensions pulumi.PreConfiguredJobStage
```

### Add the Deck UI plugin

> Starting from version 0.1.0 the plugin also has a Deck UI extension which requires the following installation steps.

You need to configure a `deck-proxy` so Gate knows where to find the plugin.

You can create or find the `gate-local.yml` in the same place as the other Halyard configuration files. This is usually `~/.hal/default/profiles` on the machine where Halyard is running.

```yaml
spinnaker:
  extensibility:
    deck-proxy:
      enabled: true
      plugins:
        Pulumi.PreConfiguredJobPlugin:
          enabled: true
          version: <version>
    repositories:
      pulumi:
        url: https://raw.githubusercontent.com/pulumi/spinnaker-plugins-repository/master/repositories.json
```

* `version`: Use version 0.1.0 or above since the custom Deck UI is only available starting from that version.

## Migrating from 0.0.x

### Working directory

Previously, the plugin cloned the Pulumi app you specify in the stage config into the `/app` folder in the container.
This required you to specify the `--cwd /app` arg for the Pulumi command args and also for the command used to restore
dependencies. Starting from 0.1.0 a new working directory option allows you to specify the folder into which the git
repository will be cloned. 
  
The restore dependencies and the Pulumi commands will now be run within the working folder. So there is no
need to specify the working directory individually for the restore dependencies and the Pulumi command args stage
inputs. You now should only specify the `--cwd` arg for Pulumi if Pulumi is inside a sub-directory of the main
working directory.

For example, if you specify the root working directory stage input as `/app` and if your Pulumi app
were not in the root of the repo and instead under an `infra` folder, then you should specify the `--cwd` for
Pulumi as `--cwd infra` which will be executed within the context of `/app`. The same applies to the restore dependencies
command as well.

### Specifying plugin configuration in the Halyard config

The plugin now supports per-pipeline configuration of the Spinnaker account and namespace. If you have previously
configured the account and namespace in your Halyard configuration file, you may now remove those and configure
them directly in the pipeline now as a stage input now. The global config options for `account`, `namespace` and
`credentials` will be removed in a future release.

## User Guide

We have put together a [guide](https://www.pulumi.com/docs/guides/continuous-delivery/spinnaker/) to walk-through how to setup and use this plugin in your Spinnaker instance. 

## Publishing A New Version

> You need to be a maintainer of this repo to be able to publish new versions to the official Pulumi plugins [repository](https://github.com/pulumi/spinnaker-plugins-repository) for Spinnaker.

See this [wiki](https://github.com/pulumi/spinnaker-preconfigured-job-plugin/wiki/Publishing-a-new-release) page for details about how to publish a new version of the plugin.
