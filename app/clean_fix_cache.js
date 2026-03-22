const fs = require('fs');
const path = require('path');

// 1. Clean Project Build Dirs (User App)
const projectDirs = [
    path.join(__dirname, 'android', '.cxx'),
    path.join(__dirname, 'android', 'app', 'build'),
    path.join(__dirname, 'android', 'build')
];

projectDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        try {
            fs.rmSync(dir, { recursive: true, force: true });
            console.log(`Deleted project dir: ${dir}`);
        } catch (e) {
            console.error(`Failed to delete ${dir}:`, e.message);
        }
    }
});

// 2. Clean Specific Corrupted Gradle Cache
// Path from error: C:\Users\iaman\.gradle\caches\8.14.3\transforms\0ba7f924bb3c819e5cc03eb8784e5872
const corruptedCache = String.raw`C:\Users\iaman\.gradle\caches\8.14.3\transforms\0ba7f924bb3c819e5cc03eb8784e5872`;

if (fs.existsSync(corruptedCache)) {
    console.log(`Deleting corrupted Gradle cache: ${corruptedCache}`);
    try {
        fs.rmSync(corruptedCache, { recursive: true, force: true });
        console.log('Successfully deleted corrupted cache.');
    } catch (e) {
        console.error(`Failed to delete cache: ${e.message}`);
        console.warn('You might need to kill any running Gradle daemons (java.exe) manually.');
    }
} else {
    console.log('Corrupted cache directory not found (maybe already deleted).');
}

console.log('Cleanup complete.');
