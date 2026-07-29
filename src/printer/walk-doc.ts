import {type Doc} from 'prettier';
import {isVerbose, verboseLog} from '../debug.js';

type Parents = {parent: Doc; childIndexInThisParent: number | undefined};

/**
 * @returns Boolean true means keep walking children and siblings, false means stop walking children
 *   and siblings. Returning false does not stop walking of aunts/uncles or ancestors.
 */
export function walkDoc({
    startDoc,
    callback,
    parents = [],
    index,
}: Readonly<{
    startDoc: Doc;
    callback: (
        currentDoc: Doc,
        parents: Parents[],
        index: number | undefined,
    ) => boolean | void | undefined;
    parents?: Parents[];
    index?: number | undefined;
}>): boolean {
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
    } else if (typeof startDoc === 'string') {
        return true;
    } else if (Array.isArray(startDoc)) {
        verboseLog('walking array children');
        // one a child returns false, abort walking this array
        startDoc.every((innerDoc, innerIndex): boolean => {
            return walkDoc({
                startDoc: innerDoc,
                callback,
                parents: [
                    {
                        parent: startDoc,
                        childIndexInThisParent: innerIndex,
                    },
                    ...parents,
                ],
                index: innerIndex,
            });
        });
    } else if ('contents' in startDoc) {
        verboseLog('walking contents property');
        return walkDoc({
            startDoc: startDoc.contents,
            callback,
            parents: [
                {
                    parent: startDoc,
                    childIndexInThisParent: undefined,
                },
                ...parents,
            ],
        });
    } else if ('parts' in startDoc) {
        verboseLog('walking parts property');
        return walkDoc({
            startDoc: startDoc.parts,
            callback,
            parents: [
                {
                    parent: startDoc,
                    childIndexInThisParent: undefined,
                },
                ...parents,
            ],
        });
    }
    return true;
}
