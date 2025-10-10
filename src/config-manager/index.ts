import * as converters from './converters';
import * as getters from './getters';

export const envVar = {
  ...getters,
  ...converters,
};
