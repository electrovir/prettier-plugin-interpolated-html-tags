import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {Plugin} from 'prettier';
import * as PluginIndex from './index.js';

describe('plugin index', () => {
    it('exports a plugin', () => {
        assert.tsType(PluginIndex).matches<Plugin>();
    });
});
