import {assert} from '@augment-vir/assert';
import {format} from 'prettier';
import {repoConfig} from './prettier-config.js';

function removeIndent(input: string): string {
    return (
        input
            .replace(/^\s*\n\s*/, '')
            .replace(/\n {12}/g, '\n')
            // eslint-disable-next-line sonarjs/slow-regex
            .replace(/\n\s+$/, '\n')
    );
}

export type TestCase = {code: string; expect?: string};

export async function testFormat(test: TestCase) {
    const inputCode = removeIndent(test.code);
    const expected = removeIndent(test.expect ?? test.code);
    const formatted = await format(inputCode, {
        filepath: 'code.ts',
        ...repoConfig,
    });
    assert.strictEquals(formatted, expected);
}
