import React from 'react';

import {
  AccountSelectInput,
  AccountService,
  FormikFormField,
  HelpField,
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
          help={
            <HelpField content="The working directory where the repository will be cloned into. All commands will be run in the context of this directory." />
          }
          input={(props) => <TextInput {...props} />}
          label="Working Directory"
          name="parameters.workingDir"
        />
        <FormikFormField
          help={
            <HelpField
              content="The repo URL to clone from. For HTTPS URLs, specify the username and password as placeholders in the URL 
            that map to the key names of secrets (see the Secrets Name parameter below). For SSH URLs, the plugin configuration must be
            updated to specify the volume name for the SSH configuration files to use. The volume would be mounted as ~/.ssh in the
            container."
            />
          }
          input={(props) => <TextInput {...props} />}
          label="Git Repo URL"
          name="parameters.gitRepoUrl"
        />
        <FormikFormField
          help={<HelpField content="The command to execute in order to restore dependencies for the Pulumi app." />}
          input={(props) => <TextInput {...props} />}
          label="Restore Dependencies Command"
          name="parameters.restoreDepsCmd"
        />

        <hr />

        <h4>Pulumi Options</h4>
        <FormikFormField
          help={
            <HelpField
              content="The container image to use for the RunJob. You may use a private image or one of Pulumi's public images.
            The image must contain the Pulumi CLI as well as the language runtime used your Pulumi apps."
            />
          }
          input={(props) => <TextInput {...props} />}
          label="Container Image"
          name="parameters.containerImage"
        />
        <FormikFormField
          help={<HelpField content="The Pulumi stack name against which the command should be executed." />}
          input={(props) => <TextInput {...props} />}
          label="Command"
          name="parameters.pulCommand"
        />
        <FormikFormField
          help={<HelpField content="The args to pass to the Pulumi command." />}
          input={(props) => <TextInput {...props} />}
          label="Command Args"
          name="parameters.pulCmdArgs"
        />
        <FormikFormField
          help={
            <HelpField content="The backend URL to use when logging into the Pulumi CLI. Uses the Pulumi Managed Service backend, by default." />
          }
          input={(props) => <TextInput {...props} />}
          label="Backend URL"
          name="parameters.backendUrl"
        />
        <FormikFormField
          help={
            <HelpField content="The name of the Kubernetes secrets resource from which additional environment variables will be set for the job." />
          }
          input={(props) => <TextInput {...props} />}
          label="Secrets Resource Name"
          name="parameters.k8sSecretsName"
        />
      </>
    );
  }
}
