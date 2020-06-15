package com.pulumi.plugin.preconfigured

import com.netflix.spinnaker.kork.plugins.api.PluginSdks
import com.netflix.spinnaker.orca.api.preconfigured.jobs.PreconfiguredJobConfigurationProvider
import com.netflix.spinnaker.orca.clouddriver.config.KubernetesPreconfiguredJobProperties
import org.pf4j.Extension
import org.pf4j.Plugin
import org.pf4j.PluginWrapper


class PulumiPlugin(wrapper: PluginWrapper): Plugin(wrapper) {

    override fun start() {
        System.out.println("PulumiPlugin.start()")
    }

    override fun stop() {
        System.out.println("PulumiPlugin.stop()")
    }
}

@Extension
class PulumiPreConfiguredStage(val pluginSdks: PluginSdks, val configuration: PluginConfig) : PreconfiguredJobConfigurationProvider {
    override fun getJobConfigurations(): List<KubernetesPreconfiguredJobProperties> {
        val jobProperties = pluginSdks.yamlResourceLoader().loadResource("com/pulumi/plugin/preconfigured/pulumi.yaml", KubernetesPreconfiguredJobProperties::class.java)
        if (!configuration.account.isNullOrEmpty()) {
            jobProperties.account = configuration.account
        }
        if (!configuration.credentials.isNullOrEmpty()) {
            jobProperties.credentials = configuration.credentials
        }
        if (!configuration.namespace.isNullOrEmpty()) {
            jobProperties.manifest.metadata.namespace = configuration.namespace
        }
        if (!configuration.sshConfigPath.isNullOrEmpty()) {
            jobProperties.manifest.spec.template.spec.containers[0].addVolumeMountsItem(io.kubernetes.client.models.V1VolumeMount().mountPath(configuration.sshConfigPath))
        }
        return arrayListOf(jobProperties)
    }
}
