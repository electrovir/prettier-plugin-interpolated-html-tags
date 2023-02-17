import {assign, defineElement, defineElementNoInputs, html} from 'element-vir';

export const MainElement = defineElementNoInputs({
    tagName: 'vir-main-element',
    renderCallback: () => {
        return html`
            <${ChildElement} 
                ${assign(ChildElement, {
                    inputExamples: 4,
                    someMore: 'hello',
                })}
            >
                <span>some children in here too</span>
            </${ChildElement}>
        `;
    },
});

export const ChildElement = defineElement<{inputExamples: number; someMore: string}>()({
    tagName: 'vir-child',
    renderCallback: () => {
        return html`
            Yo there's some stuff in here
            <slot></slot>
        `;
    },
});
