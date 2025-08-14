import fs from 'node:fs';
import path from 'node:path';

import { toDataify } from '@quanxiaoxiao/node-utils';

import { getState } from '#store.mjs';

import websiteRoutes from './website/index.mjs';
import websiteHrefRoutes from './websiteHref/index.mjs';
import websiteOperationRoutes from './websiteOperation/index.mjs';

export default {
  '/api/state': {
    put: (ctx) => {
      fs.writeFileSync(path.resolve(process.cwd(), '.state.json'), toDataify(getState()));
      ctx.response = {
        data: Date.now(),
      };
    },
  },
  ...websiteRoutes,
  ...websiteHrefRoutes,
  ...websiteOperationRoutes,
};
