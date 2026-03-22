const fs = require('fs');
const path = require('path');

const dirs = [
    path.join(__dirname, 'android', '.cxx'),
    path.join(__dirname, 'android', 'app', 'build'),
    path.join(__dirname, 'android', 'build'),
    path.join(__dirname, 'android', 'app', '.cxx')
];

dirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`Deleting ${dir}...`);
        try {
            fs.rmSync(dir, { recursive: true, force: true });
            console.log(`Deleted ${dir}`);
        } catch (e) {
            console.error(`Failed to delete ${dir}:`, e.message);
        }
    } else {
        console.log(`${dir} does not exist.`);
    }
});

console.log('Build directories cleaned.');
