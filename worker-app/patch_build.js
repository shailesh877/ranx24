const fs = require('fs');
const path = String.raw`C:\Users\iaman\.gradle\caches\8.14.3\transforms\0ba7f924bb3c819e5cc03eb8784e5872\transformed\react-android-0.81.5-debug\prefab\modules\reactnative\include\react\renderer\core\graphicsConversions.h`;

try {
    let content = fs.readFileSync(path, 'utf8');
    if (!content.includes('#include <folly/Format.h>')) {
        content = '#include <folly/Format.h>\n' + content;
        fs.writeFileSync(path, content);
        console.log('Successfully patched graphicsConversions.h');
    } else {
        console.log('File is already patched');
    }
} catch (error) {
    console.error('Error patching file:', error);
    process.exit(1);
}
