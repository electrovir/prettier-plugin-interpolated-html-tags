import {AstPath, ParserOptions, Printer} from 'prettier';
import {getOriginalPrinter} from './original-printer';
import {replaceHtmlTagPlaceholders} from './replace-html-tag-placeholders';

function wrapInOriginalPrinterCall<T extends string = string>(
    property: keyof Printer,
    subProperty?: T,
) {
    return (...args: any[]) => {
        const originalPrinter = getOriginalPrinter();

        if (property === 'print') {
            const path = args[0] as AstPath;
            const options = args[1] as ParserOptions;
            const originalOutput = originalPrinter.print.call(
                originalPrinter,
                path,
                options,
                ...(args.slice(2) as [any]),
            );

            return replaceHtmlTagPlaceholders(originalOutput, path);
        } else {
            let thisParent: any = originalPrinter;
            let printerProp = originalPrinter[property];
            if (subProperty) {
                thisParent = printerProp;
                printerProp = (printerProp as any)[subProperty];
            }
            try {
                return (printerProp as Function | undefined)?.apply(thisParent, args);
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
