import {mapObjectValues} from '@augment-vir/common';
import {getSupportInfo, Parser, Plugin, Printer, SupportLanguage} from 'prettier';
import {parsers as babelParsers} from 'prettier/parser-babel';
import {parsers as htmlParsers} from 'prettier/parser-html';
import {parsers as tsParsers} from 'prettier/parser-typescript';
import {addCustomPreprocessing} from './preprocessing';
import {makeCustomPrinter} from './printer/multiline-array-printer';
// import {interpolatedHtmlTagsPrinter} from './printer/interpolated-html-tags-printer';

// export this so we can find it later
export {pluginMarker} from './plugin-marker';

export const languages: SupportLanguage[] = getSupportInfo().languages.filter(({name}) =>
    ['javascript', 'typescript', 'html'].includes(name.toLowerCase()),
);

const htmlInjectedParsers: Record<string, Parser> = mapObjectValues(
    {
        html: htmlParsers.html,
    },
    (parserLanguage, parser): Parser => {
        return addCustomPreprocessing(parser, parserLanguage);
    },
);

export const jsInjectedParsers: Record<string, Parser<any>> = mapObjectValues(
    {
        typescript: tsParsers.typescript,
        babel: babelParsers.babel,
        'babel-ts': babelParsers['babel-ts'],
    },
    (parserLanguage, parser) => {
        return addCustomPreprocessing(parser, parserLanguage);
    },
);

export const parsers = {
    ...jsInjectedParsers,
    ...htmlInjectedParsers,
};

export const printers: Record<string, Printer<any>> = {
    html: makeCustomPrinter('html'),
    estree: makeCustomPrinter('estree'),
    'estree-json': makeCustomPrinter('estree-json'),
};

/** Not actually exported. Just for type checking purposes. */
const plugin: Plugin = {
    printers,
    parsers,
    languages,
};
