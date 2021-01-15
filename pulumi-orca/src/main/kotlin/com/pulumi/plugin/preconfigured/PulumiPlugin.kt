package com.pulumi.plugin.preconfigured

import com.netflix.spinnaker.kork.plugins.api.PluginSdks
import com.netflix.spinnaker.orca.api.preconfigured.jobs.PreconfiguredJobConfigurationProvider
import com.netflix.spinnaker.orca.clouddriver.config.KubernetesPreconfiguredJobProperties
import org.pf4j.Extension
import org.pf4j.Plugin
import org.pf4j.PluginWrapper
import org.slf4j.LoggerFactory


class PulumiPlugin(wrapper: PluginWrapper): Plugin(wrapper) {

    override fun start() {
        System.out.println("PulumiPlugin.start()")
    }

    override fun stop() {
        System.out.println("PulumiPlugin.stop()")
    }
}

@Extension
class PulumiPreConfiguredStage(val pluginSdks: PluginSdks) : PreconfiguredJobConfigurationProvider {
    private val logger = LoggerFactory.getLogger(PulumiPreConfiguredStage::class.java)

    override fun getJobConfigurations(): List<KubernetesPreconfiguredJobProperties> {
        val jobProperties = pluginSdks.yamlResourceLoader().loadResource("com/pulumi/plugin/preconfigured/pulumi.yaml", KubernetesPreconfiguredJobProperties::class.java)

        return arrayListOf(jobProperties)
    }
}
