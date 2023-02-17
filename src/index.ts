import {getSupportInfo, SupportLanguage} from 'prettier';

export const languages: SupportLanguage[] = getSupportInfo().languages.filter(({name}) => {
    return name.toLowerCase().includes('html');
});
