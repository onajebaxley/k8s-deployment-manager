import { expect } from 'chai';
import 'mocha';

import * as index from '../../src/index';

describe('[index]', () => {
    it('should expose the expected modules, functions and properties', () => {
        expect(index.LicenseManager).to.exist;
    });
});
