import {Parser, ParserOptions, Plugin, Printer} from 'prettier';
import {createWrappedMultiTargetProxy} from 'proxy-vir';
import {SetOptional} from 'type-fest';
import {debugLog} from '../debug';
import {pluginMarker} from '../plugin-marker';
import {createInterpolatedTagNamesPrinter} from '../printer/interpolated-tag-names-printer';
import {setOriginalPrinter} from '../printer/original-printer';
import {replaceTagNames} from './replace-interpolated-tag-names';

/** Prettier's type definitions are not true. */
type ActualParserOptions = SetOptional<ParserOptions, 'plugins'> &
    Partial<{
        astFormat: string;
        printer: Printer;
    }>;

export function injectInterpolatedHtmlTagsPrinter(options: ActualParserOptions): void {
    if ('printer' in options) {
        const originalPrinter = (options as any as {printer: Printer}).printer;
        setOriginalPrinter(originalPrinter);
        // overwrite the printer with ours
        (options as any as {printer: Printer}).printer = createInterpolatedTagNamesPrinter();
    } else {
        const astFormat = (options as any).astFormat;
        if (!astFormat) {
            throw new Error(`Could not find astFormat while adding printer.`);
        }
        /**
         * If the printer hasn't already been assigned in options, rearrange plugins so that ours
         * gets chosen.
         */
        const plugins = options.plugins ?? [];
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
        setOriginalPrinter(matchedPrinter);
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

export function injectCustomPreprocessing(originalParser: Parser) {
    /** Create a multi-target proxy of parsers so that we don't block other plugins. */
    const parserProxy = createWrappedMultiTargetProxy<Parser>({
        initialTarget: originalParser,
    });

    function interpolatedHtmlTagsPreProcess(text: string, options: ActualParserOptions) {
        debugger;

        injectInterpolatedHtmlTagsPrinter(options);

        return text;
    }

    async function parseWithTagNames(text: string, options: ParserOptions) {
        const fixedText = replaceTagNames(text);
        debugLog({fixedText});
        const originalOutput = await originalParser.parse(fixedText, options);
        return originalOutput;
    }

    parserProxy.proxyModifier.addOverrideTarget({
        parse: parseWithTagNames,
        preprocess: interpolatedHtmlTagsPreProcess,
    });

    return parserProxy.proxy;
}
