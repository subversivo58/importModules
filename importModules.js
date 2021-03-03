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

/**
 *
 */
class SuperAwesomeNameSpaceForEcmaScript6ModuleLoaderForServiceWorker {
    
    constructor(moduleList) {
        this.modules = [...moduleList]
        this.store = {}
    }
    
    parse(RAWScript, namespace, options) {
        
        // ES6 Sintax reserch for exportable objects
        let es6RegEx = /export {+[a-zA-Z0-9_,\s]+}|export (function+[\s|a-zA-Z0-9_]+|(const|let) +[a-zA-Z0-9_]+ =|class+[\s|a-zA-Z0-9_{]+|async [\s|a-zA-Z0-9_]+)/gmi;

        // templates ...
        let headerTPL = '/**\n' +
                        ' * ES6 Module Loader for Service Worker | @see https://github.com/subversivo58/importModules\n' +
                        ' * @license The MIT License (MIT)\n' +
                        ' * @copyright Copyright (c) ' + (new Date()).getFullYear() +' Lauro Moraes - [https://github.com/subversivo58]\n' +
                        ' */\n' +
                        '"use strict";\n\n' +
                        '// namespace reference @see https://github.com/subversivo58/importModules/wiki/namespaces\n' +
                        'const EcmaScript6ModuleNameSpace = Symbol("' + namespace + '");\n\n' +
                        'return (function ModuleNameSpace() {\n' +
                        '    ModuleNameSpace[EcmaScript6ModuleNameSpace] = {};\n'+
                        '\n', // original comments about copyright and license will be preserved below (if any)
            footerTPL = '\n    return ModuleNameSpace[EcmaScript6ModuleNameSpace];\n' +
                        '})();';

        // refferer exportables
        let exportable

        /**
         * Clear comments before analize (best fit)
         * preserve @copyright, @license, notation exclamation (important) /*! and /**!
         * @see https://stackoverflow.com/questions/5989315/#15123777
         */
        RAWScript = RAWScript.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, matched => (matched && (matched.includes('@copyright ') | matched.includes('@license ') | matched.includes('/*!') | matched.includes('/**!'))) ? '    ' + matched : '')

        /**
         * Loader dont recognize "nested dependencies" (yet)
         * launch generic error - based on "no module" script request `import`` (SyntaxError: Cannot use import statement outside a module)
         * @throw {Object}:SyntaxError - "Unexpected expression 'import'"
         */
        if ( (RAWScript.match(/import /gm) || []).length >= 1 ) {
            throw new SyntaxError("Unexpected expression 'import' ... nested dependencies are not supported (yet) - @see: https://github.com/subversivo58/importModules/wiki/limitation#nested-dependencies'")
        }

        // module counter
        let allmodules = (RAWScript.match(/export /gm) || []).length,
            OnlyOneExport = false

        // adjust default exportable
        switch (true) {
            case (allmodules === 1): {
                OnlyOneExport = true

                if ( options.type === 'import * as' ) {
                    // check if have defaulted exportable
                    if ( (RAWScript.match(/export default /gm) || []).length === 0 ) {
                        throw new SyntaxError(`The requested module '${namespace}' does not provide an export named 'default'`)
                    }
                    // catch defaulted exportion
                    RAWScript = RAWScript.replace(/export default /gm, `ModuleNameSpace[EcmaScript6ModuleNameSpace]['default'] = `)
                    // reset
                    OnlyOneExport = false
                }

                if ( options.type === 'only-default' ) {
                    // check if have defaulted exportable
                    if ( (RAWScript.match(/export default /gm) || []).length === 0 ) {
                        throw new SyntaxError(`The requested module '${namespace}' does not provide an export named 'default'`)
                    }
                }

                break
            }
                
            case (allmodules >= 2): {
                // check for double default
                if ( (RAWScript.match(/export default /gm) || []).length >= 2 ) {
                    throw new SyntaxError("Duplicate export of 'default'")
                }

                if ( options.type === 'import * as' ) {
                    // check if have defaulted exportable
                    if ( (RAWScript.match(/export default /gm) || []).length === 0 ) {
                        throw new SyntaxError(`The requested module '${namespace}' does not provide an export named 'default'`)
                    }
                    // catch defaulted exportion
                    RAWScript = RAWScript.replace(/export default /gm, `ModuleNameSpace[EcmaScript6ModuleNameSpace]['default'] = `)
                }

                if ( options.type === 'only-default' ) {
                    // check if have defaulted exportable
                    if ( (RAWScript.match(/export default /gm) || []).length === 0 ) {
                        throw new SyntaxError(`The requested module '${namespace}' does not provide an export named 'default'`)
                    }
                    OnlyOneExport = true
                }

                break
            }

            case (allmodules === 0):
            default: {
                throw new SyntaxError(`The requested module '${namespace}' does not provide an export named 'default'`)
                break
            }
        }

        //
        RAWScript = RAWScript.replace(es6RegEx, (wholeMatch) => {

            if ( wholeMatch ) {
                //
                switch (true) {
                    //
                    case wholeMatch.includes('let '): {
                        exportable = wholeMatch.replace(/export let |=|\s/gmi, '')
                        break
                    }
                    //
                    case wholeMatch.includes('const '): {
                        exportable = wholeMatch.replace(/export const |=|\s/gmi, '')
                        break
                    }
                    //
                    case wholeMatch.includes('class '): {
                        let clr = wholeMatch.replace(/export |\s$/gmi, '')
                        let p = clr.split(' ')
                        if ( p.length > 2 ) {
                            return `ModuleNameSpace[EcmaScript6ModuleNameSpace]['${p[1]}'] = ${clr}`
                        } else {
                            return `ModuleNameSpace[EcmaScript6ModuleNameSpace]['${p[1]}'] = ${clr}`
                        }
                        break
                    }
                    //
                    case wholeMatch.includes('function '): {

                        //exportable = wholeMatch.replace(/export /gmi, '')
                        let filter = wholeMatch.replace(/export /gmi, '').split(' ')
                        //
                        if ( filter.length === 2 && filter[0] === 'function' ) {
                            return `ModuleNameSpace[EcmaScript6ModuleNameSpace]['${filter[1]}'] = ${filter[0]}`
                        } else if (filter.length === 3 && filter[0] === 'async' && filter[1] === 'function' ) {
                            return `ModuleNameSpace[EcmaScript6ModuleNameSpace]['${filter[2]}'] = ${filter[0]} ${filter[1]}`
                        } else {
                            return ''
                        }
                        break
                    }
                    //
                    case wholeMatch.includes('async '): {
                        //do stuff...
                        break
                    }

                    // export by destructuring e.g: export {x, y, z}
                    case wholeMatch.includes('export {'): {
                        // clear to get only object(s) target
                        let clr = wholeMatch.replace(/export {|,|}/gmi, '')
                        // its multiples?
                        if ( clr.includes(' ') ) {
                            let p = clr.split(' '),
                                tmpTpl = ``
                            for (let i = 0; i < p.length; i++) {
                                 tmpTpl += `ModuleNameSpace[EcmaScript6ModuleNameSpace]['${p[i]}'] = ${p[i]};\n`
                            }
                            return tmpTpl
                        } else {
                            // only one
                            return `ModuleNameSpace[EcmaScript6ModuleNameSpace][${clr}] = ${clr};`
                        }
                        break
                    }

                    default: {
                        // do stuff...
                        break
                    }
                }
                return `ModuleNameSpace[EcmaScript6ModuleNameSpace]['${exportable}'] = `
            }
            return ''
        })

        /**
         * adjust only exportable "default"
         * @status: done
         */
        if ( OnlyOneExport ) {
            RAWScript = RAWScript.replace(/export default /gm, `ModuleNameSpace[EcmaScript6ModuleNameSpace] = `)
            OnlyOneExport = false
        }

        //RAWScript = RAWScript.replace(/\n/gm, '').replace(/\s+/gm, ' ')
        RAWScript = RAWScript.replace(/\n+/g, '\n    ')

        return (headerTPL += RAWScript += footerTPL)///.replace(/  +/g, ' ')//(/\s+/gm, ' ')
    }
    
    //
    init() {
        return new Promise((resolve, reject) => {
            Promise.all(this.modules.map(target =>
                fetch(target.split(' ').slice(-1)[0]).then(resp => resp.text())
            )).then(async rawList => {
                for await (let [idx, rawText] of rawList.entries()) {
                     //
                     let schema = this.modules[idx], alias, url = schema.split(' ').slice(-1)[0]
                     // parse import schema
                     switch (true) {
                         /**
                          * import one or more named exportables
                          * e.g: import { exp1, exp2, exp... } from 'path/to/module'
                          */
                         case (schema.includes('import {') && schema.includes('} from')): {
                             // original named exportables
                             if ( !schema.includes(' as ') ) {
                                 let parts = schema.replace(/import |{|}| from/g, '').split(' ')
                                 alias = (parts.length > 2) ? parts.slice(0, -1) : parts[0] // one = {String}, multiples = {Array} e.g: [exp1, exp2, exp...]
                             } else {
                                 // re-name exportables (one or more) (import { foo as bar, cat as dog } from 'uri')
                                 let parts = schema.replace(/import |\{ | as|\,|\ } from/g, '').split(' '),
                                     length = parts.length

                                 switch (true) {
                                     case (length === 3): {
                                         alias = parts.slice(0, -1)
                                         break
                                     }
                                     case (length >= 4): {
                                         let clear = schema.replace(/import {|} from/g, '').replace(' ' + url, '').trimStart().trimEnd().split(', ')
                                         alias = clear.map((e, i, a) => e.includes(' as ') ? e.split(' as ') : e)
                                         break
                                     }
                                     default: {
                                        // do stuff...
                                     }
                                 }
                             }
                             //@REVISE - add misc verification e.g: import {exp1, exp2 as named1, exp3 as named2, exp4} from 'uri'
                             break
                         }

                         /**
                          * Import all exportables to specifc namespace ... requires "default" exportable
                          * import syntax: import * as myModule from 'path/to/mymodule.js'
                          * @status: done
                          */
                         case schema.includes('import * as'): {
                             let parts = schema.replace(/import |\* as | from/g, '').split(' ')
                             alias = parts[0]
                             let parsed =  this.parse(rawText, url, {
                                 type: 'import * as',
                                 alias: alias
                             })
                             this.store[url] = {
                                alias: alias,
                                module: (new Function(parsed)())
                             }
                             break
                         }
                         // import defaut and all exportables to specific namespace (import myDefault, * as myModule from 'uri')
                         case schema.includes(', * as'): {
                             let parts = schema.replace(/import |\, \* as| from/g, '').split(' ')
                             defExp = parts[0]
                             alias  = parts[1]
                             break
                         }
                         // import default and all exportables named's (import myDefault, {exp1, exp2, exp...} from 'uri')
                         case (schema.includes(', {') && schema.includes('} from')): {
                             let parts = schema.replace(/import |\, \{|\,|\}| from /g, '').split(' ')
                             defExp = parts[0]
                             alias  = parts.slice(1, -1)
                             break
                         }
                         /**
                          * Import default to specifc namespace ... requires "default" exportable
                          * import syntax: import myModule from 'path/to/mymodule.js'
                          * @status: done
                          */
                         case ( !/\{+[a-zA-Z0-9_]+\}/.test(schema) ): {
                             alias = schema.replace(/import | from/g, '').split(' ')[0]
                             let parsed =  this.parse(rawText, url, {
                                 type: 'only-default',
                                 alias: alias
                             })
                             this.store[url] = {
                                alias: alias,
                                module: (new Function(parsed)())
                             }
                             break
                         }
                     }
                }

                for await (let [key, value] of Object.entries(this.store)) {
                    if ( Array.isArray(this.store[key].alias) ) {
                        // iterate...
                    } else {
                        Object.assign($, {
                           [this.store[key].alias]: Object.defineProperty( this.store[key].module, Symbol.toStringTag, { value: 'Module' })
                        })
                    }
                }

                // Object.preventExtensions($)

                resolve() // done

            }).catch(reject)
        })
    }
}


const importModules = function importModules() {
    let result = new SuperAwesomeNameSpaceForEcmaScript6ModuleLoaderForServiceWorker(arguments)
    return result.init()
}
