import {describe, it} from 'mocha';
import {Plugin} from 'prettier';
import {assertTypeOf} from 'run-time-assertions';
import * as PluginIndex from './index';

describe('plugin index', () => {
    it('exports a plugin', () => {
        assertTypeOf(PluginIndex).toMatchTypeOf<Plugin>();
    });
});
