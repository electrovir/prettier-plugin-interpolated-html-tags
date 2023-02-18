import {Node} from 'estree';
import {AstPath, ParserOptions, Printer} from 'prettier';
import {envDebugKey} from '../options';
import {getOriginalPrinter} from './original-printer';
import {replaceHtmlTagPlaceholders} from './replace-html-tag-placeholders';

const debug = !!process.env[envDebugKey];

function wrapInOriginalPrinterCall<T extends string = string>(
    astFormat: string,
    property: keyof Printer,
    subProperty?: T,
) {
    return (...args: any[]) => {
        const options = args[1] as ParserOptions;
        const originalPrinter = getOriginalPrinter(astFormat);
        if (property === 'print') {
            const path = args[0] as AstPath;
            const originalOutput = originalPrinter.print.call(
                originalPrinter,
                path,
                options,
                ...(args.slice(2) as [any]),
            );

            if (
                options.filepath?.endsWith('package.json') &&
                options.plugins.find(
                    (plugin) =>
                        typeof plugin === 'object' &&
                        (plugin as {name?: string}).name?.includes('prettier-plugin-packagejson'),
                )
            ) {
                return originalOutput;
            }

            if (astFormat === 'html') {
                return replaceHtmlTagPlaceholders(originalOutput, path, debug);
            } else {
                return originalOutput;
            }
        } else if (property === 'embed') {
            const originalOutput = originalPrinter.embed!.call(
                originalPrinter,
                args[0],
                args[1],
                args[2],
                args[3],
            );

            return originalOutput;
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

export function createInterpolatedTagNamesPrinter(ast: string) {
    const handleComments: Printer['handleComments'] = {
        // the avoidAstMutation property is not defined in the types
        // @ts-expect-error
        avoidAstMutation: true,
        endOfLine: wrapInOriginalPrinterCall<keyof NonNullable<Printer['handleComments']>>(
            ast,
            'handleComments',
            'endOfLine',
        ),
        ownLine: wrapInOriginalPrinterCall<keyof NonNullable<Printer['handleComments']>>(
            ast,
            'handleComments',
            'ownLine',
        ),
        remaining: wrapInOriginalPrinterCall<keyof NonNullable<Printer['handleComments']>>(
            ast,
            'handleComments',
            'remaining',
        ),
    };

    /** This is a proxy because the original printer is only set at run time. */
    const printer = new Proxy<Printer<Node>>({} as Printer<Node>, {
        get: (target, property: keyof Printer) => {
            /**
             * "handleComments" is the only printer property which isn't a callback function, so for
             * simplicity, ignore it.
             */
            if (property === 'handleComments') {
                return handleComments;
            }
            /**
             * We have to return a callback so that we can extract the jsPlugin from the options
             * argument
             */
            return wrapInOriginalPrinterCall(ast, property);
        },
    });
    return printer;
}
