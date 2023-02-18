import {Parser, ParserOptions} from 'prettier';
import {debugLog} from '../debug';
import {replaceTagNames} from './replace-interpolated-tag-names';

export function injectCustomHtmlParse(originalParser: Parser) {
    function createTagNamePlaceholders(
        text: string,
        parsers: Record<string, Parser>,
        options: ParserOptions,
    ) {
        const fixedText = replaceTagNames(text);
        debugLog({fixedText});
        debugger;
        const originalOutput = originalParser.parse(fixedText, parsers, options);
        return originalOutput;
    }

    const parser = {
        ...originalParser,
        parse: createTagNamePlaceholders,
    };

    return parser;
}
