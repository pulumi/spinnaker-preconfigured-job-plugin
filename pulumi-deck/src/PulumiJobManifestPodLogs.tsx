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

  private canShowModal(): boolean {
    const { podNameProvider } = this.props;
    return podNameProvider.getPodName() !== '';
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

  public render() {
    const { showModal, containerLogs, errorMessage, selectedContainerLog } = this.state;
    if (!this.canShowModal()) {
      return null;
    }

    return (
      <div>
        <a onClick={this.onClick} className="clickable">
          {this.props.linkName}
        </a>
        <div
          className={classNames({
            'modal-mask': true,
            'show-modal': showModal,
          })}
        >
          <div className="modal-wrapper">
            <div className="modal-container">
              <div className="modal-title">
                <h4 className="modal-title-text">Console Output: {this.getPodName()} </h4>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    this.close();
                  }}
                >
                  x
                </a>
              </div>

              <div className="modal-body">
                {containerLogs.length && (
                  <>
                    <ul className="tabs-basic console-output-tabs">
                      {containerLogs.map((log) => (
                        <li
                          key={log.name}
                          className={classNames('console-output-tab', {
                            selected: log.name === selectedContainerLog.name,
                          })}
                          onClick={() => this.selectLog(log)}
                        >
                          {log.name}
                        </li>
                      ))}
                    </ul>
                    <pre className="body-small flex-fill">{selectedContainerLog.output}</pre>
                  </>
                )}
                {errorMessage && <pre className="body-small">{errorMessage}</pre>}
              </div>

              <div className="modal-footer">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    this.close();
                  }}
                >
                  Close
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
