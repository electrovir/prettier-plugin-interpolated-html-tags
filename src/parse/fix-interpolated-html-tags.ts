import {replaceStringAtIndex} from '@augment-vir/common';

export function fixInterpolatedHtmlTags(originalText: string): string {
    let modifiedText = originalText;
    const interpolationIndexes = findAllInterpolationIndexes(originalText);

    if (!interpolationIndexes.length) {
        return modifiedText;
    }

    interpolationIndexes.reverse().forEach((interpolationIndex) => {
        const isRelevant = isTagNameInterpolation(modifiedText, interpolationIndex);
        if (!isRelevant) {
            return;
        }
        const closingBraceIndex = findClosingBraceIndex(modifiedText, interpolationIndex);
        // modifiedText = replaceStringAtIndex(modifiedText, closingBraceIndex, '', 1);
        // modifiedText = replaceStringAtIndex(modifiedText, interpolationIndex, '', 2);
        
        modifiedText = replaceStringAtIndex(modifiedText, interpolationIndex, 'stuff', closingBraceIndex - interpolationIndex + 1)
    });

    return modifiedText;
}

export function findAllInterpolationIndexes(text: string): number[] {
    const indexes: number[] = [];
    for (let index = 0; index < text.length; index++) {
        if (text[index] === '$' && text[index + 1] === '{') {
            indexes.push(index);
        }
    }

    return indexes;
}

export function isTagNameInterpolation(text: string, interpolationIndex: number): boolean {
    for (let index = interpolationIndex - 1; index >= 0; index--) {
        const character = text[index];
        if (character && character.trim()) {
            if (character === '/' && text[index - 1] === '<') {
                return true;
            } else if (character === '<') {
                return true;
            } else {
                return false;
            }
        }
    }

    return false;
}

export function findClosingBraceIndex(text: string, startingBracketIndex: number) {
    let nestedBraceCount = 0;
    for (let index = startingBracketIndex + 2; index < text.length; index++) {
        const letter = text[index];
        if (letter === '{') {
            nestedBraceCount++;
        } else if (letter === '}') {
            if (nestedBraceCount) {
                nestedBraceCount--;
            } else {
                return index;
            }
        }
    }
    throw new Error(`Failed to find closing brace`);
}
