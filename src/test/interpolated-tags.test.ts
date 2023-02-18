import {describe} from 'mocha';
import {InterpolatedTagTest, runTests} from './run-tests';

const tagTests: InterpolatedTagTest[] = [
    {
        it: 'formats basic html with no interpolation',
        // prettier-ignore
        code: `
            html\`<div class="hello">
                        </div>\`
        `,
        expect: `
            html\`
                <div class="hello"></div>
            \`;
        `,
    },
    {
        it: 'does not interfere with array formatting',
        code: `
            const myArray = [1,2,3,4,5];
            html\`<div class="hello">
                        </div>\`
        `,
        expect: `
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
        it: 'formats basic html with non-tag interpolation',
        // prettier-ignore
        code: `
            html\`<div class="hello">${'hi I like to eat food'}
                        </div>\`
        `,
        expect: `
            html\`
                <div class="hello">${'hi I like to eat food'}</div>
            \`;
        `,
    },
    {
        it: 'formats a simple interpolated tag name',
        // prettier-ignore
        code: `
                html\`                  <\${ChildElement}
                
                       >
                       
                       
                       
                       </\${ChildElement}>\`
            `,
        expect: `
            html\`
                <\${ChildElement}></\${ChildElement}>
            \`;
            `,
    },
    {
        it: 'formats a directive without interpolated tag name',
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
        expect: `
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
        it: 'formats an element with interpolated tag name an directive',
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
        expect: `
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
    {
        it: 'does not break on html comments',
        code: `
            html\`
            
                    <\${ChildElement}>
                    
                    
                    
            </\${ChildElement}>
        <!-- Verify that the child component does not rerender when we pass it the same value. -->
                <div>\${'interpolation'}</div>
                
        
        <\${ChildElement}></\${ChildElement}>
            \`
        `,
        expect: `
            html\`
                <\${ChildElement}></\${ChildElement}>
                <!-- Verify that the child component does not rerender when we pass it the same value. -->
                <div>\${'interpolation'}</div>

                <\${ChildElement}></\${ChildElement}>
            \`;
        `,
    },
];

describe('plugin correctly formats', () => {
    runTests('.ts', tagTests);
});
