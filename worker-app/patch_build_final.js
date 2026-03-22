const fs = require('fs');
const path = String.raw`C:\Users\iaman\.gradle\caches\8.14.3\transforms\0ba7f924bb3c819e5cc03eb8784e5872\transformed\react-android-0.81.5-debug\prefab\modules\reactnative\include\react\renderer\core\graphicsConversions.h`;

try {
    let content = fs.readFileSync(path, 'utf8');

    // Ensure header is included
    if (!content.includes('#include <folly/Format.h>')) {
        content = '#include <folly/Format.h>\n' + content;
    }

    // Replace folly::format with folly::sformat for string return value
    // We match exactly what we put in or the original state if we messed up
    // The goal is to have: return folly::sformat("{}%", dimension.value);

    if (content.includes('return folly::format("{}%", dimension.value);')) {
        content = content.replace('return folly::format("{}%", dimension.value);', 'return folly::sformat("{}%", dimension.value);');
        console.log('Replaced folly::format with folly::sformat');
    } else if (content.includes('return std::format("{}%", dimension.value);')) {
        content = content.replace('return std::format("{}%", dimension.value);', 'return folly::sformat("{}%", dimension.value);');
        console.log('Replaced std::format with folly::sformat');
    } else {
        console.log('Pattern not found or already patched correctly.');
    }

    fs.writeFileSync(path, content);
    console.log('Successfully patched graphicsConversions.h');

} catch (error) {
    console.error('Error patching file:', error);
    process.exit(1);
}
