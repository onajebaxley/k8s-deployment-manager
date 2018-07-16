import * as config from '@vamship/config';
import * as logger from '@vamship/logger';
import { LicenseManager } from './license-manager';

async function entrypoint(): Promise<void> {
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

    try {
        const licenseManager = new LicenseManager(
            _conf.get('app.validationHostname'),
            _conf.get('app.validationPort'),
            _conf.get('app.validationPath')
        );

        await licenseManager.halt(_conf.get('app.initialDelayPeriod'));
        await licenseManager.init();
        await licenseManager.run(_conf.get('app.validationPeriod'));
        _logger.trace('Process complete.');
    } catch (err) {
        _logger.error(`ERROR during process: ${err.message}`);
    }
}

if (process.argv.indexOf('--start') >= 0) {
    entrypoint().then((res) => {
        // err-handling done internally
    });
}

/**
 * @module root
 */
export { LicenseManager } from './license-manager';
