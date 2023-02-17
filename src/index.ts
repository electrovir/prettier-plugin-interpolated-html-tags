import {mapObjectValues} from '@augment-vir/common';
import {getSupportInfo, Parser, Plugin, Printer, SupportLanguage} from 'prettier';
import {parsers as htmlParsers} from 'prettier/parser-html';
import {injectCustomParse} from './preprocessing/inject-parse';
// import {interpolatedHtmlTagsPrinter} from './printer/interpolated-html-tags-printer';

// export this so we can find it later
export {pluginMarker} from './plugin-marker';

export const languages: SupportLanguage[] = getSupportInfo().languages.filter(({name}) => {
    return name.toLowerCase().includes('html');
});

export const parsers: Record<string, Parser> = mapObjectValues(
    {
        html: htmlParsers.html,
    },
    (parserLanguage, parser): Parser => {
        return injectCustomParse(parser, parserLanguage);
    },
);

export const printers: Record<string, Printer> = {
    // html: interpolatedHtmlTagsPrinter,
};

/** Not actually exported. Just for type checking purposes. */
const plugin: Plugin = {
    // printers,
    parsers,
    languages,
};
