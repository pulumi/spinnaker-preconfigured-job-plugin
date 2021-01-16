import React from 'react';

import {
  AccountSelectInput,
  AccountService,
  FormikFormField,
  IAccountDetails,
  IFormikStageConfigInjectedProps,
  noop,
  ReactSelectInput,
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

export interface IPulumiPluginState {
  accounts: IAccountDetails[];
  namespaces: string[];
}

export class PulumiStageForm extends React.Component<IFormikStageConfigInjectedProps, IPulumiPluginState> {
  constructor(props: IFormikStageConfigInjectedProps) {
    super(props);

    this.state = {
      accounts: [],
      namespaces: [],
    };
  }

  public async componentDidMount(): Promise<void> {
    if (!this.state.accounts || !this.state.accounts.length) {
      try {
        await this.loadAccounts();
      } catch (err) {
        console.error('Error loading accounts for kubernetes provider', err);
      }
    }
  }

  private isExpression = (value: string): boolean => (typeof value === 'string' ? value.includes('${') : false);

  public setStateAndUpdateStage(state: Partial<IPulumiPluginState>, cb?: () => void) {
    this.setState(state as IPulumiPluginState, cb || noop);
  }

  private async loadAccounts(): Promise<void> {
    const accounts = await AccountService.getAllAccountDetailsForProvider('kubernetes');
    this.setStateAndUpdateStage({ accounts });

    const parameters = this.props.formik.values['parameters'] as IPulumiPluginProps;

    // If an account hasn't been selected, then find the default account and
    // set that as the initial value.
    if (!parameters.account && accounts.length > 0) {
      parameters.account = accounts.some((e) => e.name === SETTINGS.providers.kubernetes.defaults.account)
        ? SETTINGS.providers.kubernetes.defaults.account
        : accounts[0].name;
    }
    this.handleAccountChange(parameters.account);
  }

  private handleAccountChange(selectedAccount: string) {
    this.props.formik.setFieldValue('parameters.account', selectedAccount);
    const details = (this.state.accounts || []).find((account) => account.name === selectedAccount);
    if (!details) {
      return;
    }

    const namespaces = (details.namespaces || []).sort();
    const namespace = (this.props.formik.values['parameters'] as IPulumiPluginProps).namespace;
    if (!this.isExpression(namespace) && namespaces.every((ns) => ns !== namespace)) {
      this.props.formik.setFieldValue('parameters.namespace', null);
    }

    this.setStateAndUpdateStage({
      namespaces,
    });
  }

  private handleNamespaceChange(selectedNamespace: string) {
    this.props.formik.setFieldValue('parameters.namespace', selectedNamespace);
  }

  public render() {
    const { account, namespace } = this.props.formik.values['parameters'];
    const { accounts, namespaces } = this.state;

    return (
      <>
        <h4>Account and Namespace</h4>
        <StageConfigField label="Account">
          <AccountSelectInput
            renderFilterableSelectThreshold={1}
            value={account}
            onChange={(evt: any) => this.handleAccountChange(evt.target.value)}
            accounts={accounts}
            provider="'kubernetes'"
          />
        </StageConfigField>
        <StageConfigField label="Namespace">
          <ReactSelectInput
            clearable={false}
            value={namespace}
            options={namespaces.map((ns) => ({ value: ns, label: ns }))}
            onChange={(evt: any) => this.handleNamespaceChange(evt.target.value)}
          />
        </StageConfigField>

        <hr />

        <h4>Repository Options</h4>
        <FormikFormField
          name="parameters.gitRepoUrl"
          label="Git Repo URL"
          input={(props) => <TextInput {...props} />}
        />
        <FormikFormField
          name="parameters.restoreDepsCmd"
          label="Restore Dependencies Command"
          input={(props) => <TextInput {...props} />}
        />

        <hr />

        <h4>Pulumi Options</h4>
        <FormikFormField
          name="parameters.containerImage"
          label="Container Image"
          input={(props) => <TextInput {...props} />}
        />
        <FormikFormField
          name="parameters.workingDir"
          label="Working Directory"
          input={(props) => <TextInput {...props} />}
        />
        <FormikFormField name="parameters.pulCommand" label="Command" input={(props) => <TextInput {...props} />} />
        <FormikFormField
          name="parameters.pulCmdArgs"
          label="Command Args"
          input={(props) => <TextInput {...props} />}
        />
        <FormikFormField name="parameters.backendUrl" label="Backend URL" input={(props) => <TextInput {...props} />} />
        <FormikFormField
          name="parameters.k8sSecretsName"
          label="Secrets Resource Name"
          input={(props) => <TextInput {...props} />}
        />
      </>
    );
  }
}
