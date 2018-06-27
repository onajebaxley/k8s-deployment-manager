import { argValidator as _argValidator } from '@vamship/arg-utils';
import * as _logger from '@vamship/logger';
import { Promise as _promise } from 'bluebird';
import * as kubernetes_client from 'kubernetes-client';
const _k8s_config = kubernetes_client.config;
const _k8s_client = require('kubernetes-client').Client;

/**
 * @module root
 * Represents a Kubernetes deployment manager.
 */
class DeploymentManager {
    private _validator: PromiseLike<boolean>;
    private _k8s_client: any;
    private _logger: any;

    /**
     * Constructs a DeploymentManager instance based on the given
     * license validation technique.
     *
     * @param {() => boolean} validator The license validation function to use
     */
    constructor(validator: () => boolean) {
        _argValidator.checkFunction(validator, 'validator must be a boolean-returning function.');

        this._validator = _promise.try(validator);
        this._logger = _logger.getLogger('deploy-manager');
        this._k8s_client = new _k8s_client({ config: _k8s_config.getInCluster() });
        this._logger.trace('DeploymentManager constructed.');
    }

    /**
     * Initializes this DeploymentManager to load accurate K8s client
     * specifications, and verify the license validator.
     *
     * @returns Promise<boolean> Indicating success of the validator
     */
    public async init(): Promise<boolean> {
        try {
            await this._k8s_client.loadSpec();

            this._logger.trace('Kubernetes client spec loaded.');

            const isValid = await this.executeValidator();

            return isValid;
        } catch (err) {
            this._logger.error(`ERROR loading spec: ${err.message}`);

            return false;
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
            const result = await this._validator;
            return result;
        } catch (err) {
            this._logger.error(`ERROR from provided validator: ${err.message}.`);

            return false;
        }
    }

    /**
     * Kicks off the watchdog abilities of this DeploymentManager. If, during
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
            // const pods = await this._k8s_client.api.v1.namespaces('cassandra').pods.get();
            // this._logger.debug(`Pods: ${JSON.stringify(pods)}`);
            // const cassandra = await this._k8s_client.apis.apps.v1beta1.namespaces('cassandra')
            //     .statefulsets('cassandra').scale.get();
            // const redisStatefulSet = await this._k8s_client.apis.apps.v1beta2.namespaces('redis')
            //     .statefulsets('redis-master').scale.get();
            // const redisDeployment = await this._k8s_client.apis.apps.v1beta1.namespaces('redis')
            //     .deployments('redis-slave').scale.get();
            // const rabbitMqStatefulSet = await this._k8s_client.apis.apps.v1beta2.namespaces('rmq')
            //     .statefulsets('rmq-rabbitmq').scale.get();

            // this._logger.debug(`Cassandra scale: ${JSON.stringify(cassandra)}`);
            // this._logger.debug(`Redis master scale: ${JSON.stringify(redisStatefulSet)}`);
            // this._logger.debug(`Redis slave scale: ${JSON.stringify(redisDeployment)}`);
            // this._logger.debug(`RabbitMq scale: ${JSON.stringify(rabbitMqStatefulSet)}`);
            this._logger.trace(`Scaling up services`);

            await this._scaleDeployment('cassandra', 'cassandra', 'statefulset', 3);
            this._logger.trace('Cassandra up..');

            await this._scaleDeployment('rmq-rabbitmq', 'rmq', 'statefulset', 3);
            this._logger.trace('Rmq up...');

            await this._scaleDeployment('redis-master', 'redis', 'statefulset', 1);
            this._logger.trace('redis-master up...');

            await this._scaleDeployment('redis-slave', 'redis', 'deployment', 2);
            this._logger.trace('redis-slave up...');

            this._logger.trace('DONE');

            return;
        } catch (err) {
            this._logger.error(`ERROR in DeploymentManager.run(): ${err.message}`);

            return;
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

export { DeploymentManager };