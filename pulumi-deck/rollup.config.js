const basePluginConfig = require('@spinnaker/pluginsdk/pluginconfig/rollup.config');
import injectProcessEnv from 'rollup-plugin-inject-process-env';

export default {
  ...basePluginConfig,
  plugins: [
    ...basePluginConfig.plugins,
    injectProcessEnv({
      NODE_ENV: 'production',
    }),
  ],
  input: 'src/index.ts',
};
