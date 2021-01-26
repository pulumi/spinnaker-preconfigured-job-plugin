# pulumi-deck

A Spinnaker Deck UI extension for the Pulumi plugin. This UI extension sets the user-defined parameters in the context
for the Orca part of the Pulumi plugin to use when transforming the pre-configured job manifest.

This UI extension contains two main components:

- `PulumiStageForm` is the actual form containing all the fields for user input
- `PulumiRunJobExecutionDetails` is the job execution details component

## PulumiStageForm

A simple React TypeScript-based component class. It exposes the parameters expected by the pre-configured job
manifest defined in the `pulumi-orca`, in the Deck UI, aka Spinnaker Pipelines UI.

Every `FormikFormField` field defined in this component must have an associated help key defined with the appropriate help
content that is shown to the user.

## PulumiRunJobExecutionDetails

This component and its children (`PulumiJobStageExecutionLogs`, `PulumiJobManifestPodLogs`) are heavily inspired by Spinnaker's own
[`RunJobExecutionDetails`](https://github.com/spinnaker/deck/blob/master/app/scripts/modules/kubernetes/src/pipelines/stages/runJob/RunJobExecutionDetails.tsx)
and its child components. The reason we have a custom implementation is the out-of-box `JobManifestPodLogs` component available in
`@spinnaker/core` does not auto-refresh the console output window and therefore, the user has to close the Console Output modal
and reopen it to see the latest updates. Whereas, this implementation does refresh the log output in the modal automatically.
