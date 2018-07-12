import { expect } from 'chai';
import 'mocha';

import { Utilities } from '../../../src/utilities/utilities';

describe('[utilities]', () => {
    it('should expose the expected modules, functions and properties', () => {
        expect(Utilities).to.be.an('object');
        expect(Utilities.HTTP_METHOD).to.be.an('enum');
        expect(Utilities.httpRequest).to.be.a('function');
    });

    describe('utilities.HTTP_METHOD', () => {
        it('should contain all common HTTP request methods', () => {
            expect(Utilities.HTTP_METHOD.GET).to.exist.and.equal('GET');
            expect(Utilities.HTTP_METHOD.POST).to.exist.and.equal('POST');
            expect(Utilities.HTTP_METHOD.PUT).to.exist.and.equal('PUT');
            expect(Utilities.HTTP_METHOD.DELETE).to.exist.and.equal('DELETE');
            expect(Utilities.HTTP_METHOD.HEAD).to.exist.and.equal('HEAD');
        });
    });

    describe('utilities.httpRequest', () => {
        it('should throw error given invalid hostname');

    });

});
