import {assertTypeOf} from '@augment-vir/chai';
import {describe, it} from 'mocha';
import {Plugin} from 'prettier';
import * as PluginIndex from './index';

describe('plugin index', () => {
    it('exports a plugin', () => {
        assertTypeOf(PluginIndex).toMatchTypeOf<Plugin>();
    });
});
