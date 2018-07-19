import * as _config from '@vamship/config';
import { Promise as _promise } from 'bluebird';
import _chai from 'chai';
import _chaiAsPromised from 'chai-as-promised';
import 'mocha';
import _sinon from 'sinon';
import _sinonChai from 'sinon-chai';

_chai.use(_chaiAsPromised);
_chai.use(_sinonChai);
const { expect } = _chai;
const _conf = _config.configure('k8s-deployment-manager')
    .setApplicationScope(process.env.NODE_ENV)
    .getConfig();

import { Utilities } from '../../../src/utilities/utilities';

describe('Utilities', () => {

    it('should expose the expected modules, functions and properties', () => {
        expect(Utilities).to.be.an('object');
        expect(Utilities.HTTP_METHOD).to.be.an('object');
        expect(Utilities.httpRequest).to.be.a('function');
    });

    describe('HTTP_METHOD', () => {

        it('should contain all common HTTP request methods', () => {
            expect(Utilities.HTTP_METHOD.GET).to.exist.and.equal('GET');
            expect(Utilities.HTTP_METHOD.POST).to.exist.and.equal('POST');
            expect(Utilities.HTTP_METHOD.PUT).to.exist.and.equal('PUT');
            expect(Utilities.HTTP_METHOD.DELETE).to.exist.and.equal('DELETE');
            expect(Utilities.HTTP_METHOD.HEAD).to.exist.and.equal('HEAD');
        });
    });

    describe('httpRequest()', () => {
        const VALIDATION_HOST = _conf.get('app.validationHostname');
        const VALIDATION_PORT = _conf.get('app.validationPort');
        const VALIDATION_PATH = _conf.get('app.validationPath');

        it('should return a native Promise', () => {
            const aPromise = Utilities.httpRequest(VALIDATION_HOST, VALIDATION_PORT, VALIDATION_PATH, 'GET', true);

            aPromise.then().catch((e) => ({}));
            expect(aPromise).to.be.a('Promise');
        });

        it('should reject Promise given an empty hostname', () => {
            expect(
                Utilities.httpRequest(
                    '', VALIDATION_PORT, VALIDATION_PATH,
                    Utilities.HTTP_METHOD.GET,
                    true
                )
            ).to.be.rejectedWith('The specified hostname (arg #1) must be a string of at least 1');
        });

        it('should reject Promise given an invalid HTTP method', () => {
            const invalidHttpMethods = ['', 'GETT', 'asdf', 'PUT ', { }, () => true, { test: 'ok' }];

            return _promise.map(invalidHttpMethods, (aMethod: any) => {
                const errMsg = `ERR in Utilities.httpRequest: The specified http method ${aMethod} is invalid`;
                return expect(Utilities.httpRequest(
                    VALIDATION_HOST, VALIDATION_PORT,
                    VALIDATION_PATH, aMethod, true))
                .to.be.rejectedWith(errMsg);
            });
        });

        it('should reject Promise given an invalid path', () => {
            const invalidPaths = ['1', 'no-beginning-slash', true, () => false, { test: 'ok' }, -55, 3.14159];

            return _promise.map(invalidPaths, (aPath: any) => {
                const errMsg = `ERR in Utilities.httpRequest: The given path ${aPath} must start with a "/"`;
                return expect(Utilities.httpRequest(
                    VALIDATION_HOST, VALIDATION_PORT,
                    aPath, Utilities.HTTP_METHOD.GET, true))
                .to.be.rejectedWith(errMsg);
            });
        });

        it('should reject Promise given invalid httpHeaders', () => {
            const invalidObjs = [ '1', 'a!sdFf', [1], true, () => false, -55, 3.14159 ];

            return _promise.map(invalidObjs, (anObj: any) => {
                const errMsg = `httpHeaders (arg #4) must be a valid object`;
                return expect(Utilities.httpRequest('google.com', 80, '', Utilities.HTTP_METHOD.GET, true, anObj))
                .to.be.rejectedWith(errMsg);
            });
        });

        it('should reject Promise given invalid queryParams', () => {
            const invalidObjs = [ '1', 'a!sdFf', [1], true, () => false, -55, 3.14159 ];

            return _promise.map(invalidObjs, (anObj: any) => {
                const errMsg = `query-string parameters (arg #5) must be a valid object`;
                return expect(Utilities.httpRequest('google.com', 80, '', Utilities.HTTP_METHOD.GET, true, {}, anObj))
                .to.be.rejectedWith(errMsg);
            });
        });

        it('should reject Promise given invalid JSON payload', () => {
            const invalidObjs = [ '1', 'a!sdFf', [1], true, () => false, -55, 3.14159 ];

            return _promise.map(invalidObjs, (anObj: any) => {
                const errMsg = `payload (arg #6) must be a standard object`;
                return expect(Utilities.httpRequest(
                    'google.com', 80, '',
                    Utilities.HTTP_METHOD.GET, true, {}, {}, anObj))
                .to.be.rejectedWith(errMsg);
            });
        });
    });

    describe('halt()', () => {

        it('should return a native Promise when invoked', () => {
            const shouldBeAPromise = Utilities.halt(100);

            shouldBeAPromise.then(() => ({})).catch(() => ({}));
            expect(shouldBeAPromise).to.be.a('Promise');
        });

        it('should require the given time to resolve at minimum', function(this: any, done) {
            this.timeout(4000);
            const spy = _sinon.spy();
            const waitTime = 1000;

            setTimeout(spy, waitTime - 200);

            Utilities.halt(waitTime).then((res) => {
                expect(spy).to.have.been.called;
                done();
            }).catch((err) => {
                done('ERR: halt() should have been resolved.');
            });
        });
    });

    describe('writeToFile()', () => {

        it('Should error when given an invalid filePath', () => {
            const dummyData = { };
            const invalidPaths = [ '', 999, 3.14159, -10, true, false, { a: 'b' }, () => ({}) ];

            invalidPaths.forEach((invalidPath) => {
                expect(Utilities.writeToFile.bind(undefined, dummyData, invalidPath))
                .to.throw('Invalid filePath (arg #2) specified; must be an absolute string');
            });
        });
    });

    describe('readFromFile()', () => {

        it('Should error when given an invalid filePath', () => {
            const invalidPaths = [ '', 999, 3.14159, -10, true, false, { a: 'b' }, () => ({}) ];

            invalidPaths.forEach((invalidPath) => {
                expect(Utilities.readFromFile.bind(undefined, invalidPath))
                .to.throw('Invalid filePath (arg #1) given; must be an absolute string');
            });
        });

        it('Should error when nothing exists at valid filePath', () => {
            const validPath = '/this/valid/path/contains/no/data';

            expect(Utilities.readFromFile.bind(undefined, validPath))
              .to.throw('No file exists at the given file path');
        });
    });

    describe('exists()', () => {

        it('Should error when given an invalid filePath', () => {
            const invalidPaths = [ '', 999, 3.14159, -10, true, false, { a: 'b' }, () => ({}) ];

            invalidPaths.forEach((invalidPath) => {
                expect(Utilities.exists.bind(undefined, invalidPath))
                .to.throw('Invalid filePath (arg #1) specified; must be an absolute string');
            });
        });
    });
});
