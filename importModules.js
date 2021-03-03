/**
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/importModules//blob/master/LICENSE]
 * @copyright Copyright (c) 2021 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/importModules//blob/master/VERSIONING.md]
 */

/**
 * Mapping exportable ES6 module functions whith "$" (dollar sign) `Object`
 * Note: there is no way to "hoisting" these objects to scope without polluting global variables
 */
const $ = new Proxy({}, {
    get: function(obj, prop) {
        if ( prop in obj ) {
            return obj[prop]
        }
        throw new ReferenceError(`${prop} is not defined`)
    },
    set: function(obj, prop, val) {
        if ( prop in obj ) {
            throw new TypeError('Assignment to constant variable.')
        }
        return Reflect.set(...arguments);
    }
})
