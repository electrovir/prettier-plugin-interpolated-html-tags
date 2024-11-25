const envDebugKey = 'HTML_TAGS_DEBUG';

export const isDebug = !!process.env[envDebugKey];

export function debugLog(...args: any[]) {
    if (isDebug) {
        console.info(...args);
    }
}

export const isVerbose = false as boolean;

export function verboseLog(...args: any[]) {
    if (isVerbose) {
        console.info(...args);
    }
}
