import { argValidator as _argValidator } from '@vamship/arg-utils';
import * as _config from '@vamship/config';
import * as _logger from '@vamship/logger';
import * as _fs from 'fs';
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
     * @param {boolean} isSecure Indicates whether to make the request over "https" instead of "http"
     * @param {object} httpHeaders An object whose keys are valid HTTP headers with their corresponding values
     * @param {object} queryParams An object whose keys are query-string parameters with their respective values
     * @param {object} payload An object respresenting a JSON payload to send if applicable
     */
    export async function httpRequest(
            hostname: string, port: number, path: string,
            httpMethod: string, isSecure: boolean, httpHeaders?: object,
            queryParams?: object, payload?: object): Promise<any> {
        if (Object.keys(HTTP_METHOD).map((aKey) => HTTP_METHOD[aKey]).indexOf(httpMethod) < 0) {
            const errMsg = `ERR in Utilities.httpRequest: The specified http method ${httpMethod} is invalid`;
            logger.debug(errMsg);
            throw new Error(errMsg);
        }

        const options: any = {
            method: httpMethod,
            resolveWithFullResponse: true
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

        let protocol: string = 'http://';
        if (isSecure) {
            protocol = 'https://';
        }
        options.uri = protocol + hostname + ':' + port.toString(10) + path;

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

    /**
     * Halts the execution of the calling async function for a specified period
     * of time.
     *
     * @param {number} period The integer count (in ms) to halt for
     */
    export async function halt(period: number): Promise<{}> {
        return new Promise((resolve) => setTimeout(resolve, period));
    }

    /**
     * Writes the specified content to the given file path, and returns a
     * boolean indicating the success of the operation.
     *
     * @param {string|object} data The string, array, or object of data to be written to file
     * @param {string} filePath The path (including the filename) indicating the
     *        location on disk to write to
     * @returns A boolean indicating a successful write
     */
    export function writeToFile(data: string | object | object[], filePath: string): boolean {
        _argValidator.checkString(filePath, 1, 'Invalid filePath (arg #2) specified; must be an absolute string');
        if (data && ((data instanceof Array) || typeof data === 'object')) {
            data = JSON.stringify(data, null, 4);
        } else if (typeof data !== 'string' || data.length <= 0) {
            throw new Error('Invalid data (arg #1) specified; must be a string, array, or non-circular object');
        }

        logger.trace(`Writing to file: ${filePath}`);
        _fs.writeFileSync(filePath, data, { encoding: 'utf8' });

        return true;
    }

    /**
     * Reads file (if it exists) at the specified file path, returning a string
     * containing the content of the file. Assumes UTF-8 encoding.
     *
     * @param filePath The path (including the filename) indicating the
     *        location on the filesystem to read from.
     */
    export function readFromFile(filePath: string): string {
        _argValidator.checkString(filePath, 1, 'Invalid filePath (arg #1) given; must be an absolute string');
        if (!_fs.existsSync(filePath)) {
            throw new Error(`No file exists at the given file path: ${filePath}`);
        }

        return _fs.readFileSync(filePath, { encoding: 'utf8' });
    }

    /**
     * Returns a boolean indicating whether a file exists at the specified
     * file path.
     *
     * @param {string} filePath The path (including the filename) indicating
     *        the location on disk to check for the file.
     */
    export function exists(filePath: string) {
        _argValidator.checkString(filePath, 1, 'Invalid filePath (arg #1) specified; must be an absolute string');

        return _fs.existsSync(filePath);
    }
}

export { Utilities };
