import {mapObjectValues} from '@augment-vir/common';
import type {Plugin} from 'prettier';
import {parsers as htmlParsers} from 'prettier/parser-html';
import {injectCustomPreprocessing} from './preprocessing/inject-preprocess';

// export this so we can use it later to explicitly find this plugin
export {pluginMarker} from './plugin-marker';

export const parsers: Plugin['parsers'] = mapObjectValues(
    {
        html: htmlParsers.html,
    },
    (parserLanguage, parser) => {
        return injectCustomPreprocessing(parser);
    },
);

// export const printers: Plugin['printers'] = {
//     html: interpolatedTagNamesPrinter,
// };
