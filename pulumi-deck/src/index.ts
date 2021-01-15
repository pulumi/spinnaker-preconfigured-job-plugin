import {
  ExecutionDetailsTasks,
  IDeckPlugin,
} from '@spinnaker/core';

import { PulumiStageConfig } from './PulumiStageConfig';

export const plugin: IDeckPlugin = {
  stages: [{
    key: 'pulumi',
    label: 'Run Pulumi',
  
    cloudProvider: 'kubernetes',
    component: PulumiStageConfig,
    description: 'Deploy cloud resources using Pulumi',
    executionDetailsSections: [ExecutionDetailsTasks],
  }],
};
