import {removeColor} from '@augment-vir/common';
import {assert} from 'chai';
import {it} from 'mocha';
import {format as prettierFormat, Options as PrettierOptions} from 'prettier';
import {repoConfig} from './prettier-config';

function runPrettierFormat(
    code: string,
    extension: string,
    options: Partial<PrettierOptions> = {},
    parser: string | undefined,
): string {
    if (extension.startsWith('.')) {
        extension = extension.slice(1);
    }

    const plugins = repoConfig.plugins?.map((entry) => {
        if (entry === './dist/') {
            return '.';
        } else {
            return entry;
        }
    }) ?? ['.'];

    return prettierFormat(code, {
        filepath: `blah.${extension}`,
        ...repoConfig,
        ...options,
        ...(parser ? {parser} : {}),
        plugins,
    });
}

export type InterpolatedTagTest = {
    it: string;
    code: string;
    expect?: string | undefined;
    options?: Partial<PrettierOptions> | undefined;
    force?: true;
    exclude?: true;
    failureMessage?: string;
};

let forced = false;

let allPassed = true;

function removeIndent(input: string): string {
    return input
        .replace(/^\s*\n\s*/, '')
        .replace(/\n {12}/g, '\n')
        .replace(/\n\s+$/, '\n');
}

export function runTests(extension: string, tests: InterpolatedTagTest[], parser?: string) {
    tests.forEach((test) => {
        function testCallback() {
            try {
                const inputCode = removeIndent(test.code);
                const expected = removeIndent(test.expect ?? test.code);
                const formatted = runPrettierFormat(inputCode, extension, test.options, parser);
                assert.strictEqual(formatted, expected);
                if (formatted !== expected) {
                    allPassed = false;
                }
            } catch (error) {
                allPassed = false;
                if (test.failureMessage && error instanceof Error) {
                    const strippedMessage = removeColor(error.message);
                    if (test.failureMessage !== strippedMessage) {
                        console.info({strippedMessage});
                    }
                    assert.strictEqual(removeColor(strippedMessage), test.failureMessage);
                } else {
                    throw error;
                }
            }
        }

        if (test.force) {
            forced = true;
            it.only(test.it, () => {
                testCallback();
            });
        } else if (test.exclude) {
            it.skip(test.it, testCallback);
        } else {
            it(test.it, testCallback);
        }
    });

    if (forced) {
        it.only('forced tests should not remain in the code', () => {
            if (allPassed) {
                assert.strictEqual(forced, false);
            }
        });
    }
}
