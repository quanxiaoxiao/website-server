import { createStore } from '@quanxiaoxiao/store';

import initialState from './initialState.mjs';

const {
  getState,
  dispatch,
  getValue,
} = createStore({
  initialState,
  schemas: {
    'server.port': {
      type: 'integer',
      maximum: 65535,
      minimum: 1,
    },
    'mongo.database': {
      type: 'string',
      minLength: 1,
      not: {
        pattern: '^\\s+$',
      },
    },
    'mongo.port': {
      type: 'integer',
      maximum: 65535,
      minimum: 1,
    },
  },
});

export {
  dispatch,
  getState,
  getValue,
};
