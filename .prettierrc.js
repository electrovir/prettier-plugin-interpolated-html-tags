const fs = require('fs');
const path = require('path');
const baseConfig = require('virmator/base-configs/base-prettierrc.js');

function toPosixPath(input) {
    return input.replace(/\\/g, '/').replace(/^\w+:/, '');
}

const posixDirname = path.posix.dirname(toPosixPath(__dirname));
const packageRoot = path.parse(__dirname).root;

function findClosestPackagePath(dirPath, packageName) {
    const currentAttempt = path.join(dirPath, 'node_modules', packageName);

    if (fs.existsSync(currentAttempt)) {
        return currentAttempt;
    } else if (dirPath === packageRoot) {
        throw new Error(`Could not find ${packageName} package.`);
    } else {
        return findClosestPackagePath(path.dirname(dirPath), packageName);
    }
}
/**
 * @typedef {import('prettier-plugin-multiline-arrays').MultilineArrayOptions} MultilineOptions
 *
 * @typedef {import('prettier').Options} PrettierOptions
 * @type {PrettierOptions & MultilineOptions}
 */
const prettierConfig = {
    ...baseConfig,
    plugins: [
        ...baseConfig.plugins,
        path.posix.resolve(
            posixDirname,
            toPosixPath(
                findClosestPackagePath(__dirname, 'prettier-plugin-interpolated-html-tags'),
            ),
        ),
    ],
};

console.log(prettierConfig.plugins);

module.exports = prettierConfig;
