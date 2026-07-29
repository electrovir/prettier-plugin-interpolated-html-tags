import type {AnyFunction} from '@augment-vir/common';
import {type AstPath, type ParserOptions, type Printer} from 'prettier';
import {getOriginalPrinter} from './original-printer.js';
import {replaceHtmlTagPlaceholders} from './replace-html-tag-placeholders.js';

function wrapInOriginalPrinterCall<T extends string = string>(
    property: keyof Printer,
    subProperty?: T,
) {
    return (...args: any[]) => {
        const originalPrinter = getOriginalPrinter();

        if (property === 'print') {
            const path = args[0] as AstPath;
            const options = args[1] as ParserOptions;
            const originalOutput = originalPrinter.print(
                path,
                options,
                ...(args.slice(2) as [any]),
            );

            return replaceHtmlTagPlaceholders(originalOutput, path);
        } else {
            const topLevelProp: any = Reflect.get(originalPrinter, property);
            const thisParent: any = subProperty ? topLevelProp : originalPrinter;
            const printerProp = subProperty ? topLevelProp?.[subProperty] : topLevelProp;
            try {
                return (printerProp as AnyFunction | undefined)?.apply(thisParent, args);
            } catch (error) {
                const newError = new Error(
                    `Failed to wrap JS printer call for property "${property}" ${
                        subProperty ? `and subProperty "${subProperty}"` : ''
                    }: \n`,
                );
                if (error instanceof Error && error.stack) {
                    newError.stack = newError.message + error.stack;
                }
                throw newError;
            }
        }
    };
}

export function createInterpolatedTagNamesPrinter() {
    /** This is a proxy because the original printer is only set at run time. */
    const printer = new Proxy<Printer<Node>>({} as Printer<Node>, {
        get: (target, property: keyof Printer) => {
            return wrapInOriginalPrinterCall(property);
        },
    });
    return printer;
}
