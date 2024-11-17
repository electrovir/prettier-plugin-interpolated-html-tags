import {Options} from 'prettier';
// @ts-expect-error: ignore this import cause it's not typed. We're typing it inside of here!
import importedRepoConfig from '../../prettier.config.mjs';

export const repoConfig: Options = importedRepoConfig as Options;
