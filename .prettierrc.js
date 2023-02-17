const path = require('path');
const baseConfig = require('virmator/base-configs/base-prettierrc.js');

function toPosixPath(input) {
    return input.replace(/\\/g, '/').replace(/^\w+:/, '');
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
        path.join(
            toPosixPath(process.cwd()),
            'node_modules/prettier-plugin-interpolated-html-tags',
        ),
    ],
};

console.log(prettierConfig.plugins);

module.exports = prettierConfig;
