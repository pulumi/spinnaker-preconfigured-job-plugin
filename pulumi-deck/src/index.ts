import {
  ExecutionDetailsTasks,
  IDeckPlugin,
} from '@spinnaker/core';

import { PulumiStageConfig } from './PulumiStageConfig';

export const plugin: IDeckPlugin = {
  preconfiguredJobStages: [{
    key: 'preconfiguredJob',
    label: 'Run Pulumi',
  
    cloudProvider: 'kubernetes',
    component: PulumiStageConfig,
    description: 'Deploy cloud resources using Pulumi',
    executionDetailsSections: [ExecutionDetailsTasks],
  }],
};
