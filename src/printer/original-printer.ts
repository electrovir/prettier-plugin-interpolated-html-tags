import {Printer} from 'prettier';

let originalPrinter: Printer | undefined;

export function setOriginalPrinter(input: Printer) {
    if (originalPrinter) {
        return;
    }
    originalPrinter = input;
}

export function getOriginalPrinter(): Printer {
    if (!originalPrinter) {
        throw new Error(`originalPrinter hasn't been defined yet!`);
    }
    return originalPrinter;
}
