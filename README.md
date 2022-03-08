# ember-cli-deploy-github-deployment-status

> An ember-cli-deploy plugin to update a commit's deployment status on GitHub

This plugin uses the [GitHub Repository Deployments API][1] to update the
deployment status of a commit. This deployment status will appear in Pull
Requests that contain the commit.

![ember-cli-deploy-github-deployment-status](https://cloud.githubusercontent.com/assets/416724/19148242/a15e74c8-8bb3-11e6-9470-33eb8332edd1.gif)

## What is an ember-cli-deploy plugin?

A plugin is an addon that can be executed as a part of the ember-cli-deploy
pipeline. A plugin will implement one or more of the ember-cli-deploy's pipeline
hooks.

For more information on what plugins are and how they work, please refer to the
[Plugin Documentation][2].

## Quick Start
To get up and running quickly, do the following:

- Install this plugin

```bash
$ ember install ember-cli-deploy-github-deployment-status
```

- Place the following configuration into `config/deploy.js`

```javascript
ENV['github-deployment-status'] = {
  org: '<github-org>',
  repo: '<github-repo>',
  ref: '<commit-ish-ref>'
}
```

- Run the pipeline

```bash
$ ember deploy production
```

## Why would I use this plugin?

You would use this plugin if you would like to add information about the
deployment of your application to your Pull Requests. This plugin will allow you
to add a preview link to a deployed revision of your application in to the
timeline of the Pull Request so anyone reviewing the PR can easily get to the
deployed version of code.

## What does it actually do?

Ths plugin uses the [Github Repository Deployments API][1] to create a
deployment for a commit and to update it's status based on the success or
failure of your deployment.

This plugin first implements the `willDeploy` hook where it will create a new
deployment for the commit ref specified. This will add a new entry to the PR
with a status of pending.

Then, if the deployment is successful, in the `didDeploy` hook, it will update the deployment status to
success. If you provide at `target_url`, then a link will also be added to the
status.

If, however, the deployment fails and the `didFail` hook is fired, the deployment status will be updated to
failed.

## Installation
Run the following command in your terminal:

```bash
ember install ember-cli-deploy-github-deployment-status
```

## ember-cli-deploy hooks implemented

For detailed information on what plugin hooks are and how they work, please
refer to the [Plugin Documentation][2].

- `configure`
- `setup`
- `willDeploy`
- `didDeploy`
- `didFail`

## Configuration Options

For detailed information on how configuration of plugins works, please refer to
the [Plugin Documentation][2].

### org (required)

The GitHub org that hosts the repo in which you'd like to update the deployment
status.

### repo (required)

The GitHub repo in which you'd like to update the deployment status

### ref (required)

The commit-ish ref that is being deployed. This can be a `branch`, `tag` or
`SHA`. See the [GitHub docs][3] for more info.

### token

An access token that has access to read and modify deplyoment statuses. This is
only needed if the repo is "private". The access token must have either the
`repo` or `repo_dpeloyment` scopes enabled.

*Default:* `null`

### deploymentId

The ID of a github deployment that has been created outside of ember-cli-deploy.
You might use this if you have some other system that has created the the deployment and kicked off ember-cli-deploy and you merely want this plugin to update the deployment status.

If this property does not exist, this plugin will create the deployment as well.

*Default:* `null`

### targetUrl

The target URL to associate with this status. This URL can be a string or a function.  If you choose a function, the function will get passed the context.  This URL should contain output to
keep the user updated while the task is running or serve as historical
information for what happened in the deployment. See the [GitHub docs][4] for
more info.

*Default:* `null`

```
targetUrl: 'https://target-url-example.com',
-- OR --
targetUrl(context) { `https://target-url-example.com/${context.revisionData.revisionKey}`; },
```

### task

Optional parameter to specify a task to execute. See the [GitHub docs][3] for
more info.

*Default:* `deploy`

### autoMerge

Optional parameter to merge the default branch into the requested ref if it is
behind the default branch. See the [GitHub docs][3] for more info.

*Default:* `false`

### requiredContexts

Optional array of status contexts verified against commit status checks. If this
parameter is omitted from the parameters then all unique contexts will be
verified before a deployment is created. To bypass checking entirely pass an
empty array. See the [GitHub docs][3] for more info.

*Default:* `[]`

### payload

Optional JSON payload with extra information about the deployment. See the
[GitHub docs][3] for more info.

*Default:* `null`

### environment

Optional name for the target deployment environment (e.g., production, staging,
qa). See the [GitHub docs][3] for more info.

*Default:* `'production'`

## Prerequisites

This plugin has no prerequisites.

## Running Tests

- `npm test`

<p align="center"><sub>Made with :heart: by The EmberCLI Deploy Team</sub></p>

[1]: https://developer.github.com/v3/repos/deployments/ "GitHub Deployments API"
[2]: http://ember-cli-deploy.com/plugins "Plugin Documentation"
[3]: https://developer.github.com/v3/repos/deployments/#create-a-deployment
"Github Deployments - Create a Deployment"
[4]:
https://developer.github.com/v3/repos/deployments/#create-a-deployment-status
"Github Deployments - Create a Deployment Status"
