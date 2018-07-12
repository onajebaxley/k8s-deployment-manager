import { argValidator as _argValidator } from '@vamship/arg-utils';
import * as _config from '@vamship/config';
import * as _logger from '@vamship/logger';
// import * as request_promise from 'request-promise-native';
const rp = require('request-promise-native');

/**
 * Module to contain utilitity functions, constants, etc.
 */
namespace Utilities {

    const logger = _logger.getLogger('Utilities');

    /**
     * Enumeration of the common HTTP request method types.
     */
    export enum HTTP_METHOD {
        GET = 'GET',
        PUT = 'PUT',
        POST = 'POST',
        DELETE = 'DELETE',
        HEAD = 'HEAD'
    }

    /**
     * Performs a custom HTTP request to the specified host, with the option of adding a JSON payload and
     * additional HTTP headers.
     *
     * @param {string} hostname The string of the DNS hostname to send the request to
     * @param {number} port The integer port to send the request
     * @param {string} path The string url path to follow the hostname; must begin with a '/'
     * @param {string} httpMethod The HTTP request method type
     * @param {object} httpHeaders An object whose keys are valid HTTP headers with their corresponding values
     * @param {object} queryParams An object whose keys are query-string parameters with their respective values
     * @param {object} payload An object respresenting a JSON payload to send if applicable
     */
    export async function httpRequest(
            hostname: string, port: number, path: string,
            httpMethod: string, httpHeaders?: object,
            queryParams?: object, payload?: object): Promise<any> {
        if (Object.keys(HTTP_METHOD).map((aKey) => HTTP_METHOD[aKey]).indexOf(httpMethod) < 0) {
            const errMsg = `ERR in Utilities.httpRequest: The specified http method ${httpMethod} is invalid`;
            logger.debug(errMsg);
            throw new Error(errMsg);
        }

        const options: any = {
            method: httpMethod
        };

        _argValidator.checkString(hostname, 1, 'The specified hostname (arg #1) must be a string of at least 1');
        if (!_argValidator.checkNumber(port, 1)) {
            port = 80;
        }

        if (!_argValidator.checkString(path, 0) || (path.length > 0 && path.indexOf('/') !== 0)) {
            const errMsg = `ERR in Utilities.httpRequest: The given path ${path} must start with a "/"`;
            logger.error(errMsg);
            throw new Error(errMsg);
        }

        options.uri = 'http://' + hostname + ':' + port.toString(10) + path;

        if (httpHeaders) {
            _argValidator.checkObject(httpHeaders, 'The specified httpHeaders (arg #4) must be a valid object');
            options.headers = httpHeaders;
        }
        if (queryParams) {
            _argValidator.checkObject(queryParams, 'The given query-string parameters (arg #5) must be a valid object');
            options.qs = queryParams;
        }
        if (payload) {
            _argValidator.checkObject(payload, 'The given JSON payload (arg #6) must be a standard object');
            options.json = true;
            options.body = payload;
        }

        logger.trace(`Performing async HTTP request to: ${hostname}:${port}`);
        return rp(options);
    }
}

export { Utilities };
