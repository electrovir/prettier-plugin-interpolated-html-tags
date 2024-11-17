import {omitObjectKeys} from '@augment-vir/common';
import {describe, itCases} from '@augment-vir/test';
import {testFormat, type TestCase} from './run-tests.mock.js';

const testCases: ({it: string; only?: true} & TestCase)[] = [
    {
        it: 'formats basic html with no interpolation',
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
        code: `
            html\`<div class="hello">hi I like to eat food
                        </div>\`
        `,
        expect: `
            html\`
                <div class="hello">hi I like to eat food</div>
            \`;
        `,
    },
    {
        it: 'formats a simple interpolated tag name',
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
        <!-- test comment test comment test comment test comment test comment. -->
                <div>\${'interpolation'}</div>
                
        
        <\${ChildElement}></\${ChildElement}>
            \`
        `,
        expect: `
            html\`
                <\${ChildElement}></\${ChildElement}>
                <!-- test comment test comment test comment test comment test comment. -->
                <div>\${'interpolation'}</div>

                <\${ChildElement}></\${ChildElement}>
            \`;
        `,
    },
    {
        it: 'does not require quotes around attributes',
        code: `
            html\`
                <div class=\${interpolation1}></div>
                <\${ChildElement} style=\${interpolation1}>></\${ChildElement}>
            \`;
        `,
    },
    {
        it: 'formats lots of interpolations',
        code: `
            html\`
                <main
                    \${onResize((entry) => {
                        updateState({width: entry.contentRect.width});
                    })}
                >
                    <\${TestChildElement}
                        \${assign(TestChildElement, {
                            displayNumber: state.funnyNumber,
                            width: state.width,
                        })}
                        \${listen(TestChildElement.events.speak, (event) => {
                            updateState({
                                eventsReceived: state.eventsReceived + 1,
                                lastReceivedMessage: event.detail,
                            });
                        })}
                        \${listen(MyCustomEvent, (event) => {
                            console.debug(event.detail);
                        })}
                        \${listen('click', (event) => {
                            console.debug(
                                'event should be a mouse event:',
                                // should be true
                                event instanceof MouseEvent,
                                event,
                            );
                        })}
                    ></\${TestChildElement}>
                    <\${TestChildElement}
                        \${assign(TestChildElement, {
                            displayNumber: state.funnyNumber,
                            width: state.width,
                        })}
                        \${listen(TestChildElement.events.speak, (event) => {
                            updateState({
                                eventsReceived: state.eventsReceived + 1,
                                lastReceivedMessage: event.detail,
                            });
                        })}
                        \${listen(MyCustomEvent, (event) => {
                            console.debug(event.detail);
                        })}
                        \${listen('click', (event) => {
                            console.debug(
                                'event should be a mouse event:',
                                // should be true
                                event instanceof MouseEvent,
                                event,
                            );
                        })}
                    ></\${TestChildElement}>
                    <\${TestChildElement}
                        \${assign(TestChildElement, {
                            displayNumber: state.funnyNumber,
                            width: state.width,
                        })}
                        \${listen(TestChildElement.events.speak, (event) => {
                            updateState({
                                eventsReceived: state.eventsReceived + 1,
                                lastReceivedMessage: event.detail,
                            });
                        })}
                        \${listen(MyCustomEvent, (event) => {
                            console.debug(event.detail);
                        })}
                        \${listen('click', (event) => {
                            console.debug(
                                'event should be a mouse event:',
                                // should be true
                                event instanceof MouseEvent,
                                event,
                            );
                        })}
                    ></\${TestChildElement}>
                    <\${TestChildElement}
                        \${assign(TestChildElement, {
                            displayNumber: state.funnyNumber,
                            width: state.width,
                        })}
                        \${listen(TestChildElement.events.speak, (event) => {
                            updateState({
                                eventsReceived: state.eventsReceived + 1,
                                lastReceivedMessage: event.detail,
                            });
                        })}
                        \${listen(MyCustomEvent, (event) => {
                            console.debug(event.detail);
                        })}
                        \${listen('click', (event) => {
                            console.debug(
                                'event should be a mouse event:',
                                // should be true
                                event instanceof MouseEvent,
                                event,
                            );
                        })}
                    ></\${TestChildElement}>
                    <\${TestChildElement}
                        \${assign(TestChildElement, {
                            displayNumber: state.funnyNumber,
                            width: state.width,
                        })}
                        \${listen(TestChildElement.events.speak, (event) => {
                            updateState({
                                eventsReceived: state.eventsReceived + 1,
                                lastReceivedMessage: event.detail,
                            });
                        })}
                        \${listen(MyCustomEvent, (event) => {
                            console.debug(event.detail);
                        })}
                        \${listen('click', (event) => {
                            console.debug(
                                'event should be a mouse event:',
                                // should be true
                                event instanceof MouseEvent,
                                event,
                            );
                        })}
                    ></\${TestChildElement}>
                    Welcome to the test app.
                    <button \${listen('click', () => updateState({funnyNumber: Math.random()}))}>
                        assign NEW number to child
                    </button>
                    <!-- Verify that the child component does not rerender when we pass it the same value. -->
                    <!-- Check the console logs to verify.-->
                </main>
            \`;
        `,
    },
];

describe('plugin correctly formats', () => {
    itCases(
        testFormat,
        testCases.map((testCase) => {
            return {
                ...omitObjectKeys(testCase, ['expect']),
                input: testCase,
                throws: undefined,
            };
        }),
    );
});
