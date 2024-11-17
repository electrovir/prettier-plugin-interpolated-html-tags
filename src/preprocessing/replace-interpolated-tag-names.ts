import {safeMatch} from '@augment-vir/common';
import {addReplacement} from '../replacement-map.js';

export function replaceTagNames(text: string): string {
    let modifiedText = text;
    for (let index = text.length; index >= 0; index--) {
        const letter = text[index];
        const topSlice = text.slice(index);
        if (letter === '<' && !topSlice.startsWith('<!--')) {
            let findingLetterIndex = index + 1;
            for (; findingLetterIndex < text.length; findingLetterIndex++) {
                const findingLetterLetter = text[findingLetterIndex];
                if (findingLetterLetter === '/') {
                    break;
                }

                if (findingLetterLetter?.trim().match(/[^\s/]/)) {
                    const sliced = text.slice(findingLetterIndex);
                    if (sliced.startsWith('PRETTIER_HTML_PLACEHOLDER_')) {
                        const placeholder = safeMatch(sliced, /PRETTIER.+?_JS/)[0];
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
                                replacementTagName.padEnd(closingTagPlaceholder.length, ' '),
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
        const nextLetter = text[index + 1];
        const previousLetter = text[index - 1];
        if (letter === '<' && nextLetter !== '/') {
            nested++;
        } else if (letter === '>' && previousLetter === '/') {
            nested--;
        } else if (letter === '<' && nextLetter === '/') {
            if (nested) {
                nested--;
            } else {
                break;
            }
        }
    }

    const sliced = text.slice(index + 2);
    if (sliced.startsWith('PRETTIER_HTML_PLACEHOLDER_')) {
        const closingPlaceholder = safeMatch(sliced, /PRETTIER.+?_JS/)[0];
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
