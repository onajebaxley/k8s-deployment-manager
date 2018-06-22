import { expect } from 'chai';
import 'mocha';

import { Person } from '../../src/index';

describe('[index]', () => {
    it('should expose the expected modules, functions and properties', () => {
        expect(Person).to.be.a('function');
    });
});
