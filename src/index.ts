import {mapObjectValues} from '@augment-vir/common';
import {getSupportInfo, Parser, Printer, SupportLanguage} from 'prettier';
import {parsers as htmlParsers} from 'prettier/parser-html';
import {injectCustomPreprocessing} from './preprocessing/inject-preprocess';
import {createInterpolatedTagNamesPrinter} from './printer/interpolated-tag-names-printer';

// export this so we can use it later to explicitly find this plugin
export {pluginMarker} from './plugin-marker';

export const languages: SupportLanguage[] = getSupportInfo().languages.filter(
    ({name}) => name.toLowerCase() === 'html',
);

const htmlInjectedParsers: Record<string, Parser> = mapObjectValues(
    {
        html: htmlParsers.html,
    },
    (parserLanguage, parser): Parser => {
        return injectCustomPreprocessing(parser, parserLanguage);
    },
);

export const parsers = {
    ...htmlInjectedParsers,
};

export const printers: Record<string, Printer<any>> = {
    html: createInterpolatedTagNamesPrinter('html'),
};
