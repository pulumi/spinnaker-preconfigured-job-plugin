import { IInstanceMultiOutputLog, InstanceReader, JobManifestPodLogs } from '@spinnaker/core';

import classNames from 'classnames';

import React from 'react';

import './pod-logs.less';

export class PulumiJobManifestPodLogs extends JobManifestPodLogs {
  private timeoutId: NodeJS.Timeout;
  private consoleOutputFetchIntervalMs = 5000;

  public componentWillUnmount() {
    clearTimeout(this.timeoutId);
  }

  private getResourceRegion(): string {
    return this.props.location;
  }

  private getPodName(): string {
    const { podNameProvider } = this.props;
    return `pod ${podNameProvider.getPodName()}`;
  }

  public async onClick() {
    await this.fetchConsoleOutput();
    this.open();
  }

  public close() {
    clearTimeout(this.timeoutId);
    super.close();
  }

  private async fetchConsoleOutput() {
    if (this.state.errorMessage) {
      return;
    }

    const { account } = this.props;
    const region = this.getResourceRegion();

    try {
      const response = await InstanceReader.getConsoleOutput(account, region, this.getPodName(), 'kubernetes');
      this.setState({
        containerLogs: response.output as IInstanceMultiOutputLog[],
        selectedContainerLog: response.output[0] as IInstanceMultiOutputLog,
      });

      this.timeoutId = setTimeout(async () => await this.fetchConsoleOutput(), this.consoleOutputFetchIntervalMs);
    } catch (exception) {
      this.setState({ errorMessage: exception.data.message });
    }
  }
}
