
const os = require('os');
const interfaces = os.networkInterfaces();
const results = {};

for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
        const { address, family, internal } = interface;
        if (family === 'IPv4' && !internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(address);
        }
    }
}

console.log(JSON.stringify(results, null, 2));
