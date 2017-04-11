import { randomId } from './util';

const s = typeof Symbol === 'function';
export const vueFormConfig = s ? Symbol() : `VueFormProviderConfig_${randomId}`;
export const vueFormState =  s ? Symbol() : `VueFormProviderState${randomId}`;
