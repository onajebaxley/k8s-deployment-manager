# K8s Deployment Manager

This repo contains a Kubernetes tool designed to run in your cluster which acts as a license-based deployment manager, scaling the rest of your cluster's deployments/statefulsets/replica-instances up and down based on the validity of some license.

Alternatively, this tool can manage access to your cluster's services by redirecting your Kubernetes Ingresses away from your actual services in the event of an invalid license. Doing so removes the need to scale down your deployments, but your Ingress resources must be built in such a way that the DeploymentManager knows how to revert its own changes (continue reading).

## Installation
This package will be available soon on the NPM registry. As such, please install via the npm CLI
`npm install --save @onaje/deployment-manager`

You must also create a Kubernetes `ServiceAccount` or `ClusterRoleBinding` resource for the pod you are running this tool in. this tool needs `cluster-admin` Role privileges in order to manage your K8s cluster.

## Usage
First, import the `DeploymentManager`:
    const DeploymentManager = require('@onaje/deployment-manager');
or
    import { DeploymentManager } from '@onaje/deployment-manager';

Then supply the `DeploymentManager` with the license validation method of your choosing. The only restriction here is that the function you give it MUST return a `boolean` indicating whether the license is valid.
    const myManager = new DeploymentManager(myValidationMethod);

Next, initialize the tool with `init()`, which will asynchronously use the Kubernetes environment's config in which the pod is running in order to setup its client configuration. It will also attempt to use your validation function, emitting an error
if it fails.

Finally, start the tool by giving it a period (in milliseconds) by which to check the license. It will run indefinitely.
    myManager.run(3600000) // Check the license every hour


### How to Structure your Ingresses
Coming soon..
