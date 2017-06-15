// @see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/15960
// @see https://gist.github.com/rawrmaan/be47e71bd0df3f7493ead6cefd6b400c

let fs = require('fs')
let RN_TSD = __dirname + '/node_modules/@types/react-native/index.d.ts'

fs.writeFileSync(RN_TSD, 
    fs.readFileSync(RN_TSD).toString().replace('declare global', 'declare namespace RemovedGlobals')
);
