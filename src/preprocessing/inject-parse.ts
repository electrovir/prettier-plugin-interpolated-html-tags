import {Parser, ParserOptions} from 'prettier';
import {fixInterpolatedHtmlTags} from '../parse/fix-interpolated-html-tags';

export function injectCustomParse(originalParser: Parser, parserName: string) {
    function thisPluginParse(
        text: string,
        parsers: Record<string, Parser>,
        options: ParserOptions,
    ) {
        debugger;
        console.log('yo');
        const fixedText = fixInterpolatedHtmlTags(text);
        console.log({fixedText});
        const originalOutput = originalParser.parse(fixedText, parsers, options);
        return originalOutput;
    }

    const parser = {
        ...originalParser,
        parse: thisPluginParse,
    };

    return parser;
}
