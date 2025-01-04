Add context to errors thrown inside setInterval/setTimeout/setImmediate/addListener callbacks

### Usage:

Put this:

```javascript
require ('better-stack-trace');
```

At the top of your project.

### Example:

```javascript
function example () {
  setTimeout (() => new WebAssembly (), 1);
}
example ();
```
  
Output without better-stack-trace:

    TypeError: WebAssembly is not a constructor
        at example.js:3:20
        ...

Output with better-stack-trace:

    TypeError: WebAssembly is not a constructor
        at example.js:3:20
        ...
    Caused by: setTimeout
        at example (example.js:4:20)
        at Object.<anonymous> (example.js:7:1)
        ...

Javascript tells you where did it explode. better-stack-trace helps you track who and where was the callback programmed.
