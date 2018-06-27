import * as config from '@vamship/config';
import * as logger from '@vamship/logger';
import { DeploymentManager } from './deployment-manager';

const _conf = config.configure('k8s-deployment-manager')
    .setApplicationScope(process.env.NODE_ENV)
    .getConfig();

const _logger = logger.configure('k8s-deployment-manager', {
    level: _conf.get('app.logLevel'),
    extreme: false
}).getLogger('main');

_logger.trace('Logger initialized');
_logger.trace('Detected application configuration', {
    app: _conf.get('app')
});

async function entrypoint() {
    const exValidator = () => false;
    const exManager = new DeploymentManager(exValidator);

    await exManager.init();
    await exManager.run(1000);
}

entrypoint().then((res) => {
    _logger.trace(`Process complete.`);
}).catch((err) => {
    _logger.error(`ERROR during process: ${err.message}`);
});

/**
 * @module root
 */
export { default as DeploymentManager } from './deployment-manager';
