import _chai from 'chai';
import _chaiAsPromised from 'chai-as-promised';
import 'mocha';
import _rewire from 'rewire';
import _sinonChai from 'sinon-chai';

_chai.use(_chaiAsPromised);
_chai.use(_sinonChai);
const { expect } = _chai;

const _licenseManagerModule = _rewire('../../src/license-manager');
const LicenseManager = _licenseManagerModule.LicenseManager;

describe('LicenseManager', () => {
    const _createManager = (hostname?, port?, path?) => {
        hostname = hostname || 'google.com';
        port = port || 80;
        path = path || '';

        return new LicenseManager(hostname, port, path);
    };

    describe('constructor()', () => {
        it('should expose the desired methods and properties', () => {
            const lm = new LicenseManager('host');

            expect(lm).to.be.an('object');
            expect(lm.init).to.be.a('function');
            expect(lm.run).to.be.a('function');
            expect(lm.executeValidator).to.be.a('function');
        });
    });

    describe('init()', () => {
        it('should return a Promise when invoked', function(this: any) {
            this.timeout(4000);
            const lm = _createManager();
            const shouldBeAPromise = lm.init();

            shouldBeAPromise.then((res) => ({})).catch((e) => ({}));
            expect(shouldBeAPromise).to.be.a('Promise');
            // expect(shouldBeAPromise).to.be.rejected;
        });

        it.skip('should indicate the success of validation technique when resolving'
            + ' Promise', async function(this: any, done) {
            // TODO: Spoof the service to test this properly
            this.timeout(4000);
            const lm = _createManager();
            const aPromise = lm.init();
            const res = await aPromise;

            expect(aPromise).to.be.fulfilled;
            expect(res).to.be.a('boolean').and.equal('true');
        });
    });

    describe('executeValidator()', () => {
        it('should return a native Promise when invoked', () => {
            const lm = _createManager();
            const shouldBeAPromise = lm.executeValidator();

            shouldBeAPromise.then(() => ({})).catch(() => ({}));

            expect(shouldBeAPromise).to.be.a('Promise');
        });

        it('should eventually resolve to a boolean indicating license validity');
    });

    describe('run()', () => {
        it('should do something');
    });
});
