import {
  ExecutionDetailsTasks,
  IDeckPlugin,
} from '@spinnaker/core';

import { RunJobExecutionDetails } from "@spinnaker/kubernetes/lib/pipelines/stages/runJob/RunJobExecutionDetails";

import { PulumiRunJobExecutionDetails } from './PulumiRunJobExecutionDetails';
import { PulumiStageConfig } from './PulumiStageConfig';

export const plugin: IDeckPlugin = {
  preconfiguredJobStages: [{
    key: 'preconfiguredJob',
    label: 'Run Pulumi',
  
    cloudProvider: 'kubernetes',
    component: PulumiStageConfig,
    description: 'Deploy cloud resources using Pulumi',
    executionDetailsSections: [PulumiRunJobExecutionDetails, ExecutionDetailsTasks],
  }],
};
