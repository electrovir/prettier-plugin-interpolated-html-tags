import {Parser, ParserOptions, Plugin, Printer} from 'prettier';
import {pluginMarker} from './plugin-marker';
import {injectCustomParse} from './preprocessing/inject-parse';
import {makeCustomPrinter} from './printer/multiline-array-printer';
import {setOriginalPrinter} from './printer/original-printer';

function addMultilinePrinter(options: ParserOptions): void {
    if ('printer' in options) {
        const originalPrinter = (options as any as {printer: Printer}).printer;
        setOriginalPrinter((options as unknown as {astFormat: string}).astFormat, originalPrinter);
        // overwrite the printer with ours
        (options as any as {printer: Printer}).printer = makeCustomPrinter(
            (options as unknown as {astFormat: string}).astFormat,
        );
    } else {
        const astFormat = (options as any).astFormat;
        if (!astFormat) {
            throw new Error(`Could not find astFormat while adding printer.`);
        }
        /**
         * If the printer hasn't already been assigned in options, rearrange plugins so that ours
         * gets chosen.
         */
        const plugins = options.plugins;
        const firstMatchedPlugin = plugins.find(
            (plugin): plugin is Plugin =>
                typeof plugin !== 'string' && !!plugin.printers && !!plugin.printers[astFormat],
        );
        if (!firstMatchedPlugin || typeof firstMatchedPlugin === 'string') {
            throw new Error(`Matched invalid first plugin: ${firstMatchedPlugin}`);
        }
        const matchedPrinter = firstMatchedPlugin.printers?.[astFormat];
        if (!matchedPrinter) {
            throw new Error(`Printer not found on matched plugin: ${firstMatchedPlugin}`);
        }
        setOriginalPrinter((options as unknown as {astFormat: string}).astFormat, matchedPrinter);
        const thisPluginIndex = plugins.findIndex((plugin) => {
            return (plugin as any).pluginMarker === pluginMarker;
        });
        const thisPlugin = plugins[thisPluginIndex];
        if (!thisPlugin) {
            throw new Error(`This plugin was not found.`);
        }
        // remove this plugin from its current location in the array
        plugins.splice(thisPluginIndex, 1);
        // add this plugin to the beginning of the array so its printer is found first
        plugins.splice(0, 0, thisPlugin);
    }
}

function findPluginsByParserName(parserName: string, options: ParserOptions): Plugin[] {
    return options.plugins.filter((plugin): plugin is Plugin => {
        return (
            typeof plugin === 'object' &&
            (plugin as any).pluginMarker !== pluginMarker &&
            !!plugin.parsers?.[parserName]
        );
    });
}

export function addCustomPreprocessing(originalParser: Parser, parserName: string) {
    const thisPluginPreprocess = (text: string, options: ParserOptions) => {
        const pluginsWithPreprocessor = findPluginsByParserName(parserName, options).filter(
            (plugin) => !!plugin.parsers?.[parserName]?.preprocess,
        );

        let processedText = text;

        pluginsWithPreprocessor.forEach((pluginWithPreprocessor) => {
            const nextText = pluginWithPreprocessor.parsers?.[parserName]?.preprocess?.(
                processedText,
                {
                    ...options,
                    plugins: options.plugins.filter(
                        (plugin) => (plugin as any).pluginMarker !== pluginMarker,
                    ),
                },
            );
            if (nextText != undefined) {
                processedText = nextText;
            }
        });
        if ((options as unknown as {astFormat: string}).astFormat.toLowerCase() === 'html') {
            // debugger;
        }
        addMultilinePrinter(options);

        return processedText;
    };

    const parser = {
        ...injectCustomParse(originalParser, parserName),
        preprocess: thisPluginPreprocess,
    };

    return parser;
}
