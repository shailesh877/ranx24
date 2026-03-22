const fs = require('fs');
const path = String.raw`C:\Users\iaman\.gradle\caches\8.14.3\transforms\0ba7f924bb3c819e5cc03eb8784e5872\transformed\react-android-0.81.5-debug\prefab\modules\reactnative\include\react\renderer\core\graphicsConversions.h`;

try {
    let content = fs.readFileSync(path, 'utf8');
    console.log('Original content length:', content.length);

    // 1. Ensure Header Check
    if (!content.includes('#include <folly/Format.h>')) {
        console.log('Adding header include');
        content = '#include <folly/Format.h>\n' + content;
    }

    // 2. Robust Replacement
    // We want to replace ANY of these:
    //    return std::format("{}%", dimension.value);
    //    return folly::format("{}%", dimension.value);
    // with:
    //    return folly::sformat("{}%", dimension.value);

    const targetCode = 'return folly::sformat("{}%", dimension.value);';

    if (content.includes(targetCode)) {
        console.log('File is already correctly patched with sformat.');
    } else {
        let replaced = false;
        const patterns = [
            'return std::format("{}%", dimension.value);',
            'return folly::format("{}%", dimension.value);'
        ];

        for (const pattern of patterns) {
            if (content.includes(pattern)) {
                content = content.replace(pattern, targetCode);
                console.log(`Replaced: ${pattern}`);
                replaced = true;
                break; // Only replace one instance if found
            }
        }

        if (!replaced) {
            console.warn('WARNING: Could not find target string to replace!');
            console.log('Partial content dump centered on line 80:');
            const lines = content.split('\n');
            // assuming it's around line 81
            const start = Math.max(0, 75);
            const end = Math.min(lines.length, 90);
            console.log(lines.slice(start, end).join('\n'));
        } else {
            fs.writeFileSync(path, content);
            console.log('Successfully wrote patched content.');
        }
    }

} catch (error) {
    console.error('CRITICAL ERROR:', error);
    process.exit(1);
}
