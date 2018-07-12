import { Promise as _promise } from 'bluebird';
import { expect } from 'chai';
import 'mocha';

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
            const aPromise = Utilities.httpRequest('google.com', 80, 'GET');
            expect(aPromise).to.be.a('Promise');
        });

        it('should throw error given invalid hostname');

    });

});
