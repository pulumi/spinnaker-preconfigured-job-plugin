import React from 'react';

import { FormikStageConfig, IStageConfigProps } from '@spinnaker/core';
import { PulumiStageForm } from './PulumiStageForm';

export class PulumiStageConfig extends React.Component<IStageConfigProps> {
  public render() {
    return (
      <FormikStageConfig
        {...this.props}
        onChange={this.props.updateStage}
        application="pulumi"
        render={(props) => <PulumiStageForm {...props} />}
      />
    );
  }
}
