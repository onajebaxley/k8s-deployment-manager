import { argValidator as _argValidator } from '@vamship/arg-utils';
import * as _logger from '@vamship/logger';
import { Promise as _promise } from 'bluebird';
import * as kubernetes_client from 'kubernetes-client';
import { Utilities } from './utilities/utilities';
const _k8s_config = kubernetes_client.config;
const _k8s_client = require('kubernetes-client').Client;

/**
 * @module root
 * Represents a Kubernetes deployment manager.
 */
class LicenseManager {
    private _validationHostname: string;
    private _validationPort: number;
    private _validationPath: string;
    private _k8s_client: any;
    private _logger: any;

    /**
     * Constructs a LicenseManager instance based on the given
     * license validation technique.
     *
     * @param {string} validationHost The hostname string of the validation server
     * @param {number} validationPort An integer of the port on the validation server to connect
     * @param {string} validationPath The string path to request of the hostname (must start with a "/")
     */
    constructor(validationHost: string, validationPort?: number, validationPath?: string) {
        _argValidator.checkString(validationHost, 1, 'The given hostname (arg #1) should be at least length 1');
        if (validationPort) {
            _argValidator.checkNumber(validationPort, 1, 'The given port (arg #2) must be an integer > 0');
        } else {
            validationPort = 80;
        }
        if (validationPath && (!_argValidator.checkString(validationPath, 1) || validationPath.indexOf('/') !== 0)) {
            throw Error('The given path (arg #3) must have nonzero length and start with a "/"');
        } else {
            validationPath = validationPath || '';
        }

        this._validationHostname = validationHost;
        this._validationPort = validationPort;
        this._validationPath = validationPath;
        this._logger = _logger.getLogger('license-manager');
        this._k8s_client = null; // to be initialized on init()
        this._logger.trace('LicenseManager constructed.');
    }

    /**
     * Initializes this LicenseManager to load accurate K8s client
     * specifications, and verify the given license validator is working.
     *
     * @returns Promise<boolean> Indicating success of the validator
     */
    public async init(): Promise<boolean> {
        try {
            this._k8s_client = new _k8s_client({ config: _k8s_config.getInCluster() });
            await this._k8s_client.loadSpec();

            this._logger.trace('Kubernetes client spec loaded.');

            const isValid = await this.executeValidator();

            return isValid;
        } catch (err) {
            const msg = `ERROR in LicenseManager initialization: ${err.message}`;
            this._logger.error(msg);

            throw Error(msg);
        }
    }

    /**
     * Executes the validator function provided. Returns the
     * boolean result of validation, or 'false' with an error message if the
     * given validator failed.
     *
     * @returns {Promise<boolean>} Indicating the success of the validator
     */
    public async executeValidator(): Promise<boolean> {
        try {
            const result = await Utilities.httpRequest(
                this._validationHostname,
                this._validationPort,
                this._validationPath,
                Utilities.HTTP_METHOD.GET,
                true
            );

            this._logger.trace(`Validator response: ${JSON.stringify(result)}`);
            return result.statusCode === 200;
        } catch (err) {
            this._logger.error(`ERROR from provided validator: ${err.message}.`);

            return false;
        }
    }

    /**
     * Kicks off the watchdog abilities of this LicenseManager. If, during
     * monitoring, the specified validation technique fails, this Deployment-
     * Manager will scale all Kubernetes deployments/replicasets/statefulsets
     * under its control to 0 (pods) until validation succeeds.
     *
     * @param {number} sampleRate The integer rate (in ms) at which the
     *        validity function is checked
     */
    public async run(sampleRate: number): Promise<void> {
        // TODO: implement
        if (Number.parseInt(sampleRate.toString(), 10) !== sampleRate) {
            throw Error('Specified sampleRate must be an integer');
        }

        try {
            while (true) {
                // this._logger.trace('Waiting...');
                await Utilities.halt(sampleRate);

                this._logger.trace('Checking license validity...');
                const isValid = await this.executeValidator();

                if (!isValid) {
                    this._logger.debug('Invalid license detected. Restricting access to K8s services');
                    // TODO: pick one: ingress manip or scaling down services

                } else {
                    this._logger.debug('License validated.');
                }
            }
        } catch (err) {
            this._logger.error(`ERROR in LicenseManager.run(): ${err.message}`);

            return;
        }
    }

    /**
     * Changes the given Kubernetes Ingress resource to have a single rule as
     * defined by the given parameters. Eventually returns a boolean indicating
     * whether the operation was successful.
     * NOTE: If your Ingress has multiple rules or multiple paths, these will
     * be lost. Calling this function updates the ingress to have only one rule
     *
     * @param {string} name The name of the Ingress to alter
     * @param {string} namespace The namespace in which the Ingress resides
     * @param {string} hostname The hostname to which the new rule will apply
     * @param {string} servicename The name of the ClusterIP service to point
     * @param {string} servicePort The port on the ClusterIP service to connect
     * @returns Promise<boolean> Indicating success of the operation
     */
    private async _manipulateIngress(name: string, namespace: string,
                                     hostname: string, servicename: string,
                                     serviceport: number): Promise<boolean> {
        if (Number.parseInt(serviceport.toString(), 10) !== serviceport) {
            throw Error('serviceport must be an integer.');
        }
        namespace = namespace || 'default';

        const payload = {
            body: {
                spec: {
                    rules: [
                        {host: hostname,
                        http: { paths: [
                            {backend: {serviceName: servicename, servicePort: serviceport}}
                        ]}}
                    ]
                }
            }
        };

        try {
            const res = await this._k8s_client.apis.extensions.v1beta1.namespaces(namespace)
                .ingresses(name).patch(payload);

            this._logger.debug(`Res: ${JSON.stringify(res)}`);

            if (res.statusCode !== 200) {
                this._logger.error(`ERROR updating Ingress ${name} in namespace ${namespace}: ${JSON.stringify(res)}`);

                return false;
            }

            return true;
        } catch (err) {
            this._logger.error(`ERROR in _manipulateIngress: ${err.message}`);

            return false;
        }
    }

    /**
     * Internal method to scale the given Kubernetes deployment/set down (or up)
     * to the specified amount of replicas.
     *
     * @param {string} setName The name of the Kubernetes set
     * @param {string} namespace The namespace in which the K8s set resides
     *        (default [default])
     * @param {string} setType The type of set, must be one of:
     *        "deployment","statefulset","replicaset" (default [deployment])
     * @param {number} replicaCount The integer amount of desired replicas
     *        to scale to
     *
     * @returns {boolean} Indicator of the success from performing the scale
     */
    private async _scaleDeployment(setName: string,
                                   namespace: string,
                                   setType: string,
                                   replicaCount: number): Promise<boolean> {
        if (Number.parseInt(replicaCount.toString(), 10) !== replicaCount) {
            throw Error('Replica count must be an integer.');
        }
        if (['deployment', 'statefulset', 'replicaset'].indexOf(setType.toLowerCase()) < 0) {
            throw Error('Settype must be one of: [deployment, statefulset, replicaset]');
        }
        namespace = namespace || 'default';

        const payload = {
            body: {
                spec: { replicas: replicaCount }
            }
        };

        try {
            let res: any;

            switch (setType) {
                case 'statefulset':
                    res = await this._k8s_client.apis.apps.v1.namespaces(namespace)
                    .statefulsets(setName).scale.patch(payload);
                    break;
                case 'replicaset':
                    res = await this._k8s_client.apis.apps.v1.namespaces(namespace)
                    .replicasets(setName).scale.patch(payload);
                    break;
                case 'deployment':
                    res = await this._k8s_client.apis.apps.v1.namespaces(namespace)
                    .deployments(setName).scale.patch(payload);
                    break;
                default:
                    res = await this._k8s_client.apis.apps.v1.namespaces(namespace)
                    .deployments(setName).scale.patch(payload);
                    break;
            }

            this._logger.debug(`Res: ${JSON.stringify(res)}`);

            if (res.statusCode !== 200) {
                this._logger.error(`ERROR scaling ${setType} ${setName}: ${JSON.stringify(res)}`);

                return false;
            }

            return true;
        } catch (err) {
            this._logger.error(`ERROR in _scaleDeployment: ${err.message}`);

            return false;
        }
    }
}

export { LicenseManager };
