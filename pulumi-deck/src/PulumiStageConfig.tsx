import React from 'react';
import { defaults } from 'lodash';

import { FormikStageConfig, IStage, IStageConfigProps } from '@spinnaker/core';
import { DEFAULT_PLUGIN_PROPS, PulumiStageForm } from './PulumiStageForm';

export class PulumiStageConfig extends React.Component<IStageConfigProps> {
  public render() {
    return (
      <FormikStageConfig
        {...this.props}
        onChange={this.props.updateStage}
        render={(props) => (
          <PulumiStageForm {...props} {...DEFAULT_PLUGIN_PROPS} stageFieldUpdated={this.props.stageFieldUpdated} />
        )}
      />
    );
  }
}
