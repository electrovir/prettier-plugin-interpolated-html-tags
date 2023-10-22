import {createDeferredPromiseWrapper, removeColor} from '@augment-vir/common';
import {assert} from 'chai';
import {it} from 'mocha';
import {Options as PrettierOptions, format as prettierFormat} from 'prettier';
import {repoConfig} from './prettier-config';

async function runPrettierFormat(
    code: string,
    extension: string,
    options: Partial<PrettierOptions> = {},
    parser: string | undefined,
): Promise<string> {
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

    return await prettierFormat(code, {
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

function removeIndent(input: string): string {
    return input
        .replace(/^\s*\n\s*/, '')
        .replace(/\n {12}/g, '\n')
        .replace(/\n\s+$/, '\n');
}

export function runTests(extension: string, tests: InterpolatedTagTest[], parser?: string) {
    let forced = false;

    const passedTests: Promise<boolean[]> = Promise.all(
        tests.map(async (test) => {
            const deferredPromise = createDeferredPromiseWrapper<boolean>();

            async function testCallback() {
                try {
                    const inputCode = removeIndent(test.code);
                    const expected = removeIndent(test.expect ?? test.code);
                    const formatted = await runPrettierFormat(
                        inputCode,
                        extension,
                        test.options,
                        parser,
                    );
                    assert.strictEqual(formatted, expected);
                    deferredPromise.resolve(true);
                } catch (error) {
                    if (test.failureMessage && error instanceof Error) {
                        deferredPromise.resolve(false);
                        const strippedMessage = removeColor(error.message);
                        if (test.failureMessage !== strippedMessage) {
                            console.info({strippedMessage});
                        }
                        assert.strictEqual(removeColor(strippedMessage), test.failureMessage);
                    } else {
                        deferredPromise.reject(error);
                    }
                }
            }

            if (test.force) {
                forced = true;
                it.only(test.it, testCallback);
            } else if (test.exclude) {
                it.skip(test.it, testCallback);
            } else {
                it(test.it, testCallback);
            }

            return deferredPromise.promise;
        }),
    );

    if (forced) {
        it.only('forced tests should not remain in the code', async () => {
            const allPassed = (await passedTests).every((entry) => entry === true);

            if (allPassed) {
                assert.strictEqual(forced, false);
            }
        });
    }
}
