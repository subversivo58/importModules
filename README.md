# importModules
ServiceWorker ES6 Modules Loader

## TL;DR

This lib is loaded into `ServiceWorker` via `importScripts()` and exposes the `importModules()` method.

Your return is based on `Promise()`, use `async` in your `ServiceWorker` events.


```javascript
importScripts(
    'path/to/loader.js'
)

self.addEventListener('install', async event => {
    // most suggestive name, not found
    const Setup = async () => {
        // happiness
        await importModules(
            'import DefautedExportable, { exp1, exp2 as exp3, exp4 } from uri/to/module.js' // complete sintax
        )
        // I know, this is a poor example :)
        return (!!$.DefaultedExportable) ? Promise.resolve() : Promise.reject()
    }
    
    event.waitUntil(
        Setup()
    )
})
```

What does it do? this search the dependencies in text format (`Fetch()`), parse the import instructions to encapsulate the imported script in an **IIEF** function ... inject the dependencies with their respective alias, namespaces and renames to the local scope object reference ($) with `eval()`

**see "warn" section bellow**



## Limitations:

* it doesn't matter sub dependencies [see](https://github.com/subversivo58/importModules/wiki/limitation#nested-dependencies)
* does not work with cyclicality modules
* it is not cached. for being stored only in memory, after the device restarts or the browser process is terminated, the reference to modules is lost



## Todo:

- [ ] improve `RegExp` rules
- [ ] save raw scripts into `IndexedDB` to "recharge" modules reference at memory
- [ ] import sub dependencies - [see](https://github.com/subversivo58/importModules/issues/1)
- [ ] more ...



## Warn:

This project is a "case study/proof of concept", it is unstable and under development while the native solution of ES6 modules for `ServiceWorker` does not land on browsers

**You not should**:

* **do not use in production (at least, not yet)**
* **do not import third party scripts into your application**



## License:

MIT License

Copyright (c) 2020 Lauro Moraes [https://github.com/subversivo58]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
