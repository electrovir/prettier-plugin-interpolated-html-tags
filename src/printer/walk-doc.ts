import {Doc} from 'prettier';
import {isVerbose, verboseLog} from '../debug.js';

type Parents = {parent: Doc; childIndexInThisParent: number | undefined};

/**
 * @returns Boolean true means keep walking children and siblings, false means stop walking children
 *   and siblings. Returning false does not stop walking of aunts/uncles or ancestors.
 */
export function walkDoc(
    startDoc: Doc,
    /** Return something falsy to prevent walking of child docs */
    callback: (
        currentDoc: Doc,
        parents: Parents[],
        index: number | undefined,
    ) => boolean | void | undefined,
    parents: Parents[] = [],
    index: number | undefined = undefined,
): boolean {
    if (!startDoc) {
        return true;
    }
    if (isVerbose) {
        const parent = parents[0];
        console.info({
            firingCallbackFor: startDoc,
            status: 'Calling callback',
            parent: parent
                ? {
                      isArray: Array.isArray(parent),
                      type: (parent as any)?.type ?? typeof parent,
                  }
                : undefined,
            index,
        });
    }
    if (!callback(startDoc, parents, index)) {
        // if the callback returns something falsy, don't try to walk its children
        return false;
    }
    if (typeof startDoc === 'string') {
        return true;
    } else if (Array.isArray(startDoc)) {
        verboseLog('walking array children');
        // one a child returns false, abort walking this array
        startDoc.every((innerDoc, index): boolean => {
            return walkDoc(
                innerDoc,
                callback,
                [
                    {parent: startDoc, childIndexInThisParent: index},
                    ...parents,
                ],
                index,
            );
        });
    } else if ('contents' in startDoc) {
        verboseLog('walking contents property');
        return walkDoc(
            startDoc.contents,
            callback,
            [
                {parent: startDoc, childIndexInThisParent: undefined},
                ...parents,
            ],
            undefined,
        );
    } else if ('parts' in startDoc) {
        verboseLog('walking parts property');
        return walkDoc(
            startDoc.parts,
            callback,
            [
                {parent: startDoc, childIndexInThisParent: undefined},
                ...parents,
            ],
            undefined,
        );
    }
    return true;
}
