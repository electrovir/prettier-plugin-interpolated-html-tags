import {AstPath, Doc} from 'prettier';
import {ReplacementKey, clearReplacements, getReplacement} from '../replacement-map';
import {walkDoc} from './walk-doc';

type SpanLocation = {
    file: {content: string; url: string};
    col: number;
    line: number;
    offset: number;
};
type Span = {start: SpanLocation; end: SpanLocation; details: any | null};

type HtmlElementNode = {
    attrs?: any[];
    children?: HtmlChildNode[];
    cssDisplay: string;
    endSourceSpan: Span;
    hasExplicitNamespace: boolean;
    hasHtmComponentClosingTag: boolean;
    i18n: null;
    isIndentationSensitive: boolean;
    isLeadingSpaceSensitive: boolean;
    isSelfClosing: boolean;
    isTrailingSpaceSensitive: boolean;
    isWhitespaceSensitive: boolean;
    name: string;
    nameSpan: Span;
    namespace: null;
    sourceSpan: Span;
    startSourceSpan: Span;
    tagDefinition?: {
        canSelfClose: boolean;
        closedByChildren: {};
        closedByParent: boolean;
        contentType: number;
        ignoreFirstLf: boolean;
        implicitNamespacePrefix: null;
        isVoid: boolean;
    };
    type: 'element';
    parent: HtmlParentNode;
};

type HtmlParentNode = HtmlRootNode | HtmlElementNode;

type HtmlAttributeNode = {
    // this is always 'block' from what I've seen so far
    cssDisplay: string;
    hasExplicitNamespace: boolean;
    i18n: null;
    isSelfClosing: boolean;
    name: string;
    nameSpan: Span;
    namespace: null;
    sourceSpan: Span;
    type: 'attribute';
    value: null;
    valueSpan: null;
    parent: HtmlParentNode;
};

type HtmlRootNode = {
    children: HtmlChildNode[];
    cssDisplay: string;
    isIndentSensitive: boolean;
    isSelfClosing: boolean;
    isWhitespaceSensitive: boolean;
    sourceSpan: Span;
    type: 'root';
};

type HtmlTextNode = {
    cssDisplay: string;
    hasLeadingSpaces: boolean;
    isLeadingSpaceSensitive: boolean;
    isSelfClosing: boolean;
    isTrailingSpaceSensitive: boolean;
    sourceSpan: Span;
    type: 'text';
    value: string;
    parent: HtmlParentNode;
};

type HtmlChildNode = HtmlTextNode | HtmlAttributeNode | HtmlElementNode;

type HtmlNode = HtmlTextNode | HtmlAttributeNode | HtmlElementNode | HtmlRootNode;

export function replaceHtmlTagPlaceholders(originalFormattedOutput: Doc, path: AstPath) {
    const node = path.getValue() as HtmlNode;

    if (node.type === 'element') {
        const replacementOpeningTagName = getReplacement(node.name as ReplacementKey, 'open');
        if (replacementOpeningTagName) {
            walkDoc(originalFormattedOutput, (currentDoc, parentDocs, index) => {
                const currentParent = parentDocs[0];
                const parentDoc = currentParent?.parent;
                if (typeof currentDoc === 'string') {
                    if (currentDoc === `<${node.name}`) {
                        if (index == undefined) {
                            throw new Error(`Found opening tag but index is undefined`);
                        }
                        if (!Array.isArray(parentDoc)) {
                            throw new Error(`Found opening tag but parentDoc is not an array`);
                        }
                        parentDoc[index] = `<${replacementOpeningTagName}` as any;
                    }
                    if (currentDoc === `</${node.name}`) {
                        const replacementClosingTagName = getReplacement(
                            node.name as ReplacementKey,
                            'close',
                        );
                        if (index == undefined) {
                            throw new Error(`Found closing tag but index is undefined`);
                        }
                        if (!Array.isArray(parentDoc)) {
                            throw new Error(`Found closing tag but parentDoc is not an array`);
                        }
                        parentDoc[index] = `</${replacementClosingTagName}` as any;
                        clearReplacements(node.name as ReplacementKey);
                    }
                }
                return true;
            });
        }
    }

    return originalFormattedOutput;
}
