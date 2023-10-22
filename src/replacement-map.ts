import {randomString} from '@augment-vir/common';

type TagType = 'close' | 'open';

const replacementMap = new Map<ReplacementKey, Record<TagType, string>>();

/** @deprecated This should only be used in debugging */
export function debugGetMap(): void {
    return replacementMap as any;
}

const replacementPrefix = 't-' as const;

export type ReplacementKey = `${typeof replacementPrefix}${string}`;

function createKey(length: number): ReplacementKey {
    const randomSuffix = randomString(length - replacementPrefix.length);
    return `${replacementPrefix}${randomSuffix}`;
}

export function addReplacement(value: string, type: TagType, key?: ReplacementKey) {
    if (!key) {
        key = createKey(value.length);
    }
    let storedRecord = replacementMap.get(key);
    if (!storedRecord) {
        storedRecord = {
            close: '',
            open: '',
        };

        replacementMap.set(key, storedRecord);
    }
    storedRecord[type] = value;
    return key;
}

export function getReplacement(key: ReplacementKey, type: TagType): string | undefined {
    const value = replacementMap.get(key);
    const typeValue = value?.[type];
    return typeValue;
}

export function clearReplacements(key: ReplacementKey) {
    replacementMap.delete(key);
}
