import {Printer} from 'prettier';

let originalPrinters: Record<string, Printer> = {};

export function setOriginalPrinter(key: string, input: Printer) {
    originalPrinters[key] = input;
}

export function getOriginalPrinter(key: string): Printer {
    const printer = originalPrinters[key];
    if (!printer) {
        debugger;
        throw new Error(`originalPrinter with key '${key}' hasn't been defined yet!`);
    }
    return printer;
}
