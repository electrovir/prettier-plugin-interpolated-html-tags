import {itCases} from '@augment-vir/chai';
import {
    findAllInterpolationIndexes,
    findClosingBraceIndex,
    fixInterpolatedHtmlTags,
    isTagNameInterpolation,
} from './fix-interpolated-html-tags';

describe(fixInterpolatedHtmlTags.name, () => {
    itCases(fixInterpolatedHtmlTags, [
        {
            it: 'replaces simple interpolated tag names',
            input: '<${Element}></${Element}>',
            expect: '<Element></Element>',
        },
    ]);
});

describe(findAllInterpolationIndexes.name, () => {
    itCases(findAllInterpolationIndexes, [
        {
            it: 'finds a simple interpolation index',
            input: '${',
            expect: [0],
        },
        {
            it: 'finds multiple simple interpolation indexes',
            input: '${}${}${}',
            expect: [
                0,
                3,
                6,
            ],
        },
        {
            it: 'finds multiples indexes when there is other content',
            input: "${some other content in there} also some other stuff${\n}${'\n'}",
            expect: [
                0,
                52,
                56,
            ],
        },
    ]);
});

describe(isTagNameInterpolation.name, () => {
    itCases(isTagNameInterpolation, [
        {
            it: 'detects an opening tag name interpolation',
            inputs: [
                '<${}',
                1,
            ],
            expect: true,
        },
        {
            it: 'detects a closing tag name interpolation',
            inputs: [
                '</${}',
                2,
            ],
            expect: true,
        },
        {
            it: 'ignores other interpolations',
            inputs: [
                '${} </${}',
                6,
            ],
            expect: true,
        },
        {
            it: 'detects a simple interpolation that is not a tag',
            inputs: [
                'some stuff ${}',
                11,
            ],
            expect: false,
        },
        {
            it: 'detects a tag name interpolation with whitespace',
            inputs: [
                '<\n${}',
                2,
            ],
            expect: true,
        },
    ]);
});

describe(findClosingBraceIndex.name, () => {
    itCases(findClosingBraceIndex, [
        {
            it: 'finds a simple closing brace',
            inputs: [
                'stuff ${}',
                6,
            ],
            expect: 8,
        },
        {
            it: 'handles interior nesting',
            inputs: [
                "s ${`inner string with ${'interpolation'}`} some other stuff",
                2,
            ],
            expect: 42,
        },
        {
            it: 'handles exterior interpolations',
            inputs: [
                '<${Element}></${Element}>',
                1,
            ],
            expect: 10,
        },
    ]);
});
