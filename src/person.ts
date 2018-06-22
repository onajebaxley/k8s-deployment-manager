import { argValidator as _argValidator } from '@vamship/arg-utils';

/**
 * @module root
 * Represents a person.
 */
export default class Person {
    private _firstName: string;
    private _lastName: string;

    /**
     */
    constructor(firstName: string, lastName: string) {
        _argValidator.checkString(
            firstName,
            1,
            'firstName cannot be empty (arg #1)'
        );
        _argValidator.checkString(
            lastName,
            1,
            'lastName cannot be empty (arg #2)'
        );
        this._firstName = firstName;
        this._lastName = lastName;
    }

    /**
     * The full name of the person.
     */
    public get name(): string {
        return `${this._firstName} ${this._lastName}`;
    }

    /**
     * Return a greeting message for the person.
     */
    public greet(): string {
        return `Hello, ${this.name}`;
    }
}
