import { expect } from 'chai';
import 'mocha';

import { ArgError } from '@vamship/error-types';
import { testValues as _testValues } from '@vamship/test-utils';
import Person from '../../src/person';

describe('Person', () => {
    function _createInstance(firstName?: string, lastName?: string) {
        const fName: string = firstName || _testValues.getString('firstName');
        const lName: string = lastName || _testValues.getString('lastName');
        return new Person(fName, lName);
    }

    describe('ctor()', () => {
        it('should throw an error if invoked without a valid firstName', () => {
            const message = 'firstName cannot be empty (arg #1)';
            const wrapper = () => {
                const lastName = _testValues.getString('lastName');
                return new Person('', lastName);
            };

            expect(wrapper).to.throw(ArgError, message);
        });

        it('should throw an error if invoked without a valid lastName', () => {
            const message = 'lastName cannot be empty (arg #2)';
            const wrapper = () => {
                const firstName = _testValues.getString('firstName');
                return new Person(firstName, '');
            };

            expect(wrapper).to.throw(ArgError, message);
        });

        it('should expose the expected properties and methods', () => {
            const firstName = _testValues.getString('firstName');
            const lastName = _testValues.getString('lastName');

            const person = new Person(firstName, lastName);
            expect(person.name).to.equal(`${firstName} ${lastName}`);
            expect(person.greet).to.be.a('function');
        });
    });

    describe('greet()', () => {
        it('should return a greeting message when invoked', () => {
            const person = _createInstance();
            const expectedGreeting = `Hello, ${person.name}`;

            expect(person.greet()).to.equal(expectedGreeting);
        });
    });
});
