import React from 'react';

import {
  AccountSelectInput,
  AccountService,
  FormikFormField,
  IAccountDetails,
  IFormikStageConfigInjectedProps,
  noop,
  ReactSelectInput,
  SelectInput,
  SETTINGS,
  StageConfigField,
  TextInput,
} from '@spinnaker/core';

/**
 * Property names must match the `parameters` defined in the
 * pre-configured job yaml. The yaml file can be found in the Orca
 * extension of this plugin.
 */
export interface IPulumiProps {
  gitRepoUrl: string;
  restoreDependenciesCmd: string;
  workingDir: string;
  containerImage: string;
  pulCommand: string;
  pulCmdArgs: string;
  backendUrl: string;
  k8sSecretsName: string;
}

/**
 * Property names must match the `parameters` defined in the
 * pre-configured job yaml. The yaml file can be found in the Orca
 * extension of this plugin.
 */
export interface IPulumiPluginProps extends IPulumiProps {
  account: string;
  namespace: string;
  stageFieldUpdated?(): void;
}

const DEFAULT_CORE_PROPS: IPulumiProps = {
  gitRepoUrl: '',
  workingDir: '/app',
  backendUrl: 'https://api.pulumi.com',
  pulCommand: 'preview',
  pulCmdArgs: '',
  containerImage: 'pulumi/pulumi:latest',
  restoreDependenciesCmd: 'yarn install',
  k8sSecretsName: 'pulumi-secrets',
};

export const DEFAULT_PLUGIN_PROPS: IPulumiPluginProps = {
  account: 'spinnaker',
  namespace: 'spinnaker',
  ...DEFAULT_CORE_PROPS,
};

export interface IPulumiPluginState {
  accounts: IAccountDetails[];
  namespaces: string[];
  pluginProps: IPulumiPluginProps;
}

export class PulumiStageForm extends React.Component<
  IPulumiPluginProps & IFormikStageConfigInjectedProps,
  IPulumiPluginState
> {
  constructor(props: IPulumiPluginProps & IFormikStageConfigInjectedProps) {
    super(props);

    this.state = {
      pluginProps: props,
      accounts: [],
      namespaces: [],
    };
  }

  public async componentDidMount(): Promise<void> {
    await this.loadAccounts();
  }

  private isExpression = (value: string): boolean => (typeof value === 'string' ? value.includes('${') : false);

  public setStateAndUpdateStage(state: Partial<IPulumiPluginState>, cb?: () => void) {
    if (state.pluginProps && this.props.stageFieldUpdated) {
      this.props.stageFieldUpdated();
    }
    this.setState(state as IPulumiPluginState, cb || noop);
  }

  private async loadAccounts(): Promise<void> {
    const accounts = await AccountService.getAllAccountDetailsForProvider('kubernetes');
    this.setStateAndUpdateStage({ accounts });

    const stateProps = this.state.pluginProps;

    // If an account hasn't been selected, then find the default account and
    // set that as the initial value.
    if (!stateProps.account && accounts.length > 0) {
      stateProps.account = accounts.some((e) => e.name === SETTINGS.providers.kubernetes.defaults.account)
        ? SETTINGS.providers.kubernetes.defaults.account
        : accounts[0].name;
    }
    this.handleAccountChange(stateProps.account);
  }

  private handleAccountChange(selectedAccount: string) {
    const details = (this.state.accounts || []).find((account) => account.name === selectedAccount);
    if (!details) {
      return;
    }

    const namespaces = (details.namespaces || []).sort();
    let namespace = this.state.pluginProps.namespace;
    if (
      !this.isExpression(this.state.pluginProps.namespace) &&
      namespaces.every((ns) => ns !== this.state.pluginProps.namespace)
    ) {
      namespace = null;
    }

    this.setStateAndUpdateStage({
      namespaces,
      pluginProps: {
        ...this.state.pluginProps,
        account: selectedAccount,
        namespace,
      },
    });
  }

  private handleNamespaceChange(selectedNamespace: string) {
    this.setStateAndUpdateStage({
      pluginProps: {
        ...this.state.pluginProps,
        namespace: selectedNamespace,
      },
    });
  }

  public render() {
    const pluginProps = this.props;
    const { accounts, namespaces } = this.state;

    return (
      <>
        <h4>Account and Namespace</h4>
        <StageConfigField label="Account">
          <AccountSelectInput
            renderFilterableSelectThreshold={1}
            value={pluginProps.account}
            onChange={(evt: any) => this.handleAccountChange(evt.target.value)}
            accounts={accounts}
            provider="'kubernetes'"
          />
        </StageConfigField>
        <StageConfigField label="Namespace">
          <ReactSelectInput
            clearable={false}
            value={{ value: pluginProps.namespace, label: pluginProps.namespace }}
            options={namespaces.map((ns) => ({ value: ns, label: ns }))}
            onChange={(evt: any) => this.handleNamespaceChange(evt.target.value)}
          />
        </StageConfigField>

        <hr />

        <h4>Repository Options</h4>
        <FormikFormField name="gitRepoUrl" label="Git Repo URL" input={(props) => <TextInput {...props} />} />
        <FormikFormField
          name="restoreDepsCmd"
          label="Restore Dependencies Command"
          input={(props) => <TextInput {...props} />}
        />

        <hr />

        <h4>Pulumi Options</h4>
        <FormikFormField
          name="containerImage"
          label="Container Image"
          input={(props) => <TextInput {...props} value={pluginProps.containerImage} />}
        />
        <FormikFormField
          name="pulCommand"
          label="Command"
          input={(props) => <TextInput {...props} value={pluginProps.pulCommand} />}
        />
        <FormikFormField
          name="pulCmdArgs"
          label="Command Args"
          input={(props) => <TextInput {...props} value={pluginProps.pulCmdArgs} />}
        />
        <FormikFormField
          name="backendUrl"
          label="Backend URL"
          input={(props) => <TextInput {...props} value={pluginProps.backendUrl} />}
        />
        <FormikFormField
          name="k8sSecretsName"
          label="Secrets Resource Name"
          input={(props) => <TextInput {...props} value={pluginProps.k8sSecretsName} />}
        />
        <FormikFormField
          name="workingDir"
          label="Working Directory"
          input={(props) => <TextInput {...props} value={pluginProps.workingDir} />}
        />
      </>
    );
  }
}
