import { Promise as _promise } from 'bluebird';
import _chai from 'chai';
import _chaiAsPromised from 'chai-as-promised';
import 'mocha';
import _sinonChai from 'sinon-chai';

_chai.use(_chaiAsPromised);
_chai.use(_sinonChai);
const { expect } = _chai;

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
        it ('should return a native Promise', () => {
            const aPromise = Utilities.httpRequest('google.com', 80, '', 'GET');
            expect(aPromise).to.be.a('Promise');
        });

        it('should reject Promise given an empty hostname', () => {
            expect(
                Utilities.httpRequest(
                    '', 80, '',
                    Utilities.HTTP_METHOD.GET
                )
            ).to.be.rejectedWith('The specified hostname (arg #1) must be a string of at least 1');
        });

        it('should reject Promise given an invalid HTTP method', () => {
            const invalidHttpMethods = ['', 'GETT', 'asdf', 'PUT ', { }, () => true, { test: 'ok' }];

            return _promise.map(invalidHttpMethods, (aMethod: any) => {
                const errMsg = `ERR in Utilities.httpRequest: The specified http method ${aMethod} is invalid`;
                return expect(Utilities.httpRequest('google.com', 80, '', aMethod))
                .to.be.rejectedWith(errMsg);
            });
        });

        it('should reject Promise given an invalid path', () => {
            const invalidPaths = ['1', 'no-beginning-slash', true, () => false, { test: 'ok' }, -55, 3.14159];

            return _promise.map(invalidPaths, (aPath: any) => {
                const errMsg = `ERR in Utilities.httpRequest: The given path ${aPath} must start with a "/"`;
                return expect(Utilities.httpRequest('google.com', 80, aPath, Utilities.HTTP_METHOD.GET))
                .to.be.rejectedWith(errMsg);
            });
        });

        it('should reject Promise given invalid httpHeaders', () => {
            const invalidObjs = [ '1', 'a!sdFf', [1], true, () => false, -55, 3.14159 ];

            return _promise.map(invalidObjs, (anObj: any) => {
                const errMsg = `httpHeaders (arg #4) must be a valid object`;
                return expect(Utilities.httpRequest('google.com', 80, '', Utilities.HTTP_METHOD.GET, anObj))
                .to.be.rejectedWith(errMsg);
            });
        });

        it('should reject Promise given invalid queryParams', () => {
            const invalidObjs = [ '1', 'a!sdFf', [1], true, () => false, -55, 3.14159 ];

            return _promise.map(invalidObjs, (anObj: any) => {
                const errMsg = `query-string parameters (arg #5) must be a valid object`;
                return expect(Utilities.httpRequest('google.com', 80, '', Utilities.HTTP_METHOD.GET, {}, anObj))
                .to.be.rejectedWith(errMsg);
            });
        });

        it('should reject Promise given invalid JSON payload', () => {
            const invalidObjs = [ '1', 'a!sdFf', [1], true, () => false, -55, 3.14159 ];

            return _promise.map(invalidObjs, (anObj: any) => {
                const errMsg = `payload (arg #6) must be a standard object`;
                return expect(Utilities.httpRequest('google.com', 80, '', Utilities.HTTP_METHOD.GET, {}, {}, anObj))
                .to.be.rejectedWith(errMsg);
            });
        });
    });

});
