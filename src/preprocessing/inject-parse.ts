import {safeMatch} from '@augment-vir/common';
import {Parser, ParserOptions} from 'prettier';
import {addReplacement} from '../replacement-map';

export function injectCustomParse(originalParser: Parser, parserName: string) {
    function thisPluginParse(
        text: string,
        parsers: Record<string, Parser>,
        options: ParserOptions,
    ) {
        // console.log({parserName, text});
        let fixedText: string | undefined;
        if (parserName === 'html') {
            // debugger;
            // fixedText = '<derp PRETTIER_HTML_PLACEHOLDER_0_0_IN_JS\n    PRETTIER_HTML_PLACEHOLDER_1_0_IN_JS\n\n    ><span>\nsome children in here too</span></derp> PRETTIER_HTML_PLACEHOLDER_2_0_IN_JS'
            // console.log('starting');
            fixedText = replaceTagNames(text);
            // console.log({fixedText});
        }
        // const fixedText = fixInterpolatedHtmlTags(text);
        // console.log({fixedText});
        // debugger;
        const originalOutput = originalParser.parse(fixedText || text, parsers, options);
        return originalOutput;
    }

    const parser = {
        ...originalParser,
        parse: thisPluginParse,
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
                        // console.log({placeholder});
                        const replacementTagName = addReplacement(placeholder, 'open');
                        modifiedText = modifiedText.replace(placeholder, replacementTagName);
                        const closingTagPlaceholder = findClosingPlaceholder(
                            modifiedText,
                            findingLetterIndex,
                        );
                        // console.log({closingTagPlaceholder});
                        if (closingTagPlaceholder) {
                            addReplacement(closingTagPlaceholder, 'close', replacementTagName);
                            modifiedText = modifiedText.replace(
                                closingTagPlaceholder,
                                replacementTagName,
                            );
                        }
                    }
                    // console.log({findingLetterLetter});
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
    // console.log({sliced});
    if (sliced.startsWith('PRETTIER_HTML_PLACEHOLDER_')) {
        const closingPlaceholder = safeMatch(sliced, /PRETTIER\w+\d+\w+\d+\w+?_JS/)[0];
        if (!closingPlaceholder) {
            throw new Error(
                `failed to extract the full prettier closing placeholder at index '${index}' from: ${text}`,
            );
        }
        // console.log({closingPlaceholder});
        return closingPlaceholder;
    } else {
        return '';
    }
}
