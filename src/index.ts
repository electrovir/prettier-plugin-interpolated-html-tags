import {mapObjectValues} from '@augment-vir/common';
import type {Plugin} from 'prettier';
import {parsers as htmlParsers} from 'prettier/plugins/html';
import {injectCustomPreprocessing} from './preprocessing/inject-preprocess.js';

// export this so we can use it later to explicitly find this plugin
export {pluginMarker} from './plugin-marker.js';

/** The HTML parsers that support interpolated tag names. */
export const parsers: Plugin['parsers'] = mapObjectValues(
    {
        html: htmlParsers.html,
    },
    (parserLanguage, parser) => {
        return injectCustomPreprocessing(parser);
    },
);
