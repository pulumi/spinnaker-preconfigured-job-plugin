import { IInstanceMultiOutputLog, IJobManifestPodLogsProps, InstanceReader, JobManifestPodLogs } from '@spinnaker/core';

import DOMPurify from 'dompurify';
import AnsiUp from 'ansi_up';

import './pod-logs.less';

export class PulumiJobManifestPodLogs extends JobManifestPodLogs {
  private timeoutId: NodeJS.Timeout;
  private consoleOutputFetchIntervalMs = 5000;

  private ansi: AnsiUp;

  constructor(props: IJobManifestPodLogsProps) {
    super(props);
    this.ansi = new AnsiUp();
  }

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
      const containerLogs = response.output as IInstanceMultiOutputLog[];
      containerLogs.forEach((log: IInstanceMultiOutputLog) => {
        log.formattedOutput = DOMPurify.sanitize(this.ansi.ansi_to_html(log.output));
      });
      this.setState({
        containerLogs,
        selectedContainerLog: containerLogs[0],
      });

      this.timeoutId = setTimeout(async () => await this.fetchConsoleOutput(), this.consoleOutputFetchIntervalMs);
    } catch (exception) {
      clearTimeout(this.timeoutId);
      this.setState({ errorMessage: exception?.data?.message });
    }
  }
}
