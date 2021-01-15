package com.pulumi.plugin.preconfigured

import com.netflix.spinnaker.kork.plugins.api.PluginConfiguration

@PluginConfiguration
data class PluginConfig(
        var account: String?,
        var credentials: String?,
        var namespace: String?,
        var sshConfigPath: String?,
        var logJobProperties: Boolean?)
