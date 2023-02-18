import {randomString} from '@augment-vir/node-js';

type TagType = 'close' | 'open';

const replacementMap = new Map<ReplacementKey, Record<TagType, string>>();

const replacementKeyPrefix = 'electrovir-prettier-interpolated-tags-' as const;

export type ReplacementKey = `${typeof replacementKeyPrefix}${string}`;

function createKey(): ReplacementKey {
    return `${replacementKeyPrefix}${randomString()}`;
}

export function addReplacement(value: string, type: TagType, key?: ReplacementKey) {
    if (!key) {
        key = createKey();
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

    if (value == undefined) {
        return undefined;
    }

    const typeValue = value[type];

    if (value == undefined) {
        return undefined;
    }

    return typeValue;
}

export function clearReplacements(key: ReplacementKey) {
    replacementMap.delete(key);
}
