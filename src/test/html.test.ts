import {describe} from 'mocha';
import {InterpolatedTagTest, runTests} from './run-tests';

const htmlTests: InterpolatedTagTest[] = [
    {
        name: 'basic html with no interpolation',
        // prettier-ignore
        code: `
            html\`<div class="hello">
                        </div>\`
        `,
        expected: `
            html\`
                <div class="hello"></div>
            \`;
        `,
    },
    {
        name: 'does not interfere with array formatting',
        code: `
            const myArray = [1,2,3,4,5];
            html\`<div class="hello">
                        </div>\`
        `,
        expected: `
            const myArray = [
                1,
                2,
                3,
                4,
                5,
            ];
            html\`
                <div class="hello"></div>
            \`;
        `,
    },
    {
        name: 'basic html with non-tag interpolation',
        // prettier-ignore
        code: `
            html\`<div class="hello">${'hi I like to eat food'}
                        </div>\`
        `,
        expected: `
            html\`
                <div class="hello">${'hi I like to eat food'}</div>
            \`;
        `,
    },
    {
        name: 'with simple interpolated tag name',
        // prettier-ignore
        code: `
                html\`                  <\${ChildElement}
                
                       >
                       
                       
                       
                       </\${ChildElement}>\`
            `,
        expected: `
            html\`
                <\${ChildElement}></\${ChildElement}>
            \`;
            `,
    },
    {
        name: 'directive without interpolated tag name',
        // prettier-ignore
        code: `
                html\`<div
                \${assign(ChildElement, {
                    inputExamples: 4,
                    someMore: 'hello',
                })}

    ><span>
            some children in here too</span></div>\`
            `,
        expected: `
            html\`
                <div
                    \${assign(ChildElement, {
                        inputExamples: 4,
                        someMore: 'hello',
                    })}
                >
                    <span>some children in here too</span>
                </div>
            \`;
            `,
    },
    {
        name: 'with interpolated tag name',
        // prettier-ignore
        code: `
                html\`<\${ChildElement}
                \${assign(ChildElement, {
                    inputExamples: 4,
                    someMore: 'hello',
                })}

    ><span>
            some children in here too</span></\${ChildElement}>\`
            `,
        expected: `
            html\`
                <\${ChildElement}
                    \${assign(ChildElement, {
                        inputExamples: 4,
                        someMore: 'hello',
                    })}
                >
                    <span>some children in here too</span>
                </\${ChildElement}>
            \`;
            `,
    },
];

describe('html interpolated tag names formatting', () => {
    runTests('.ts', htmlTests);
});

describe('TS html formatting', () => {
    runTests('.ts', [
        {
            name: 'interpolation in html tagged template',
            // prettier-ignore
            code: `
            html\`<div \${assign(ChildElement, {
                        inputExamples: 4,
                        someMore: 'hello',
                    })}class="hello">
                        </div>\`
        `,
            expected: `
            html\`
                <div
                    \${assign(ChildElement, {
                        inputExamples: 4,
                        someMore: 'hello',
                    })}class="hello"
                ></div>
            \`;
        `,
        },
    ]);
});
