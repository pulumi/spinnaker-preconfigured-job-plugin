import React from 'react';
import { template, isEmpty } from 'lodash';
import { Observable, Subject } from 'rxjs';

import { IManifest, Application, IPodNameProvider, ManifestReader } from '@spinnaker/core';

import { PulumiJobManifestPodLogs } from './PulumiJobManifestPodLogs';

interface IJobStageExecutionLogsProps {
  deployedName: string;
  account: string;
  application: Application;
  externalLink: string;
  podNameProvider: IPodNameProvider;
  location: string;
  isCompleted: boolean;
}

interface IJobStageExecutionLogsState {
  manifest?: IManifest;
}

export class PulumiJobStageExecutionLogs extends React.Component<
  IJobStageExecutionLogsProps,
  IJobStageExecutionLogsState
> {
  public state = {
    manifest: {} as IManifest,
  };

  private destroy$ = new Subject();

  public componentDidMount() {
    const { account, location, deployedName } = this.props;
    Observable.from(ManifestReader.getManifest(account, location, deployedName))
      .takeUntil(this.destroy$)
      .subscribe(
        (manifest) => this.setState({ manifest }),
        () => {},
      );
  }

  private renderExternalLink(link: string, manifest: IManifest): string {
    if (!link.includes('{{')) {
      return link;
    }
    // use {{ }} syntax to align with the annotation driven UI which this
    // derives from
    return template(link, { interpolate: /{{([\s\S]+?)}}/g })({ ...manifest });
  }

  public render() {
    const { manifest } = this.state;
    const { externalLink, podNameProvider, location, account } = this.props;

    // prefer links to external logging platforms
    if (!isEmpty(manifest) && externalLink) {
      return (
        <a target="_blank" href={this.renderExternalLink(externalLink, manifest)}>
          Console Output (External)
        </a>
      );
    }

    return (
      <>
        {location && (
          <PulumiJobManifestPodLogs
            account={account}
            location={location}
            podNameProvider={podNameProvider}
            linkName="Console Output"
          />
        )}
      </>
    );
  }
}
