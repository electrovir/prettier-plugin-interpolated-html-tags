import {safeMatch} from '@augment-vir/common';
import {Parser, ParserOptions} from 'prettier';
import {addReplacement} from '../replacement-map';

export function injectCustomHtmlParse(originalParser: Parser) {
    function createTagNamePlaceholders(
        text: string,
        parsers: Record<string, Parser>,
        options: ParserOptions,
    ) {
        const fixedText = replaceTagNames(text);
        const originalOutput = originalParser.parse(fixedText || text, parsers, options);
        return originalOutput;
    }

    const parser = {
        ...originalParser,
        parse: createTagNamePlaceholders,
    };

    return parser;
}

export function replaceTagNames(text: string): string {
    let modifiedText = text;
    for (let index = text.length; index >= 0; index--) {
        const letter = text[index];
        if (letter === '<') {
            let findingLetterIndex = index + 1;
            for (; findingLetterIndex < text.length; findingLetterIndex++) {
                const findingLetterLetter = text[findingLetterIndex];
                if (findingLetterLetter === '/') {
                    break;
                }

                if (findingLetterLetter?.trim().match(/[^\s\n\/]/)) {
                    const sliced = text.slice(findingLetterIndex);
                    if (sliced.startsWith('PRETTIER_HTML_PLACEHOLDER_')) {
                        const placeholder = safeMatch(sliced, /PRETTIER\w+\d+\w+\d+\w+?_JS/)[0];
                        if (!placeholder) {
                            throw new Error(
                                `failed to extract the full prettier placeholder at index '${findingLetterIndex}' from: ${text}`,
                            );
                        }
                        const replacementTagName = addReplacement(placeholder, 'open');
                        modifiedText = modifiedText.replace(placeholder, replacementTagName);
                        const closingTagPlaceholder = findClosingPlaceholder(
                            modifiedText,
                            findingLetterIndex,
                        );
                        if (closingTagPlaceholder) {
                            addReplacement(closingTagPlaceholder, 'close', replacementTagName);
                            modifiedText = modifiedText.replace(
                                closingTagPlaceholder,
                                replacementTagName,
                            );
                        }
                    }
                    break;
                }
            }
        }
    }

    return modifiedText;
}

function findClosingPlaceholder(text: string, startIndex: number): string {
    let index = startIndex + 1;
    let nested = 0;
    for (; index < text.length; index++) {
        const letter = text[index];
        if (letter === '<' && text[index + 1] !== '/') {
            nested++;
        } else if (letter === '>' && text[index - 1] === '/') {
            nested--;
        } else if (letter === '<' && text[index + 1] === '/') {
            if (nested) {
                nested--;
            } else {
                break;
            }
        }
    }

    const sliced = text.slice(index + 2);
    if (sliced.startsWith('PRETTIER_HTML_PLACEHOLDER_')) {
        const closingPlaceholder = safeMatch(sliced, /PRETTIER\w+\d+\w+\d+\w+?_JS/)[0];
        if (!closingPlaceholder) {
            throw new Error(
                `failed to extract the full prettier closing placeholder at index '${index}' from: ${text}`,
            );
        }
        return closingPlaceholder;
    } else {
        return '';
    }
}
