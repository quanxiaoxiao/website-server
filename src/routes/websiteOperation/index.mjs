
import createError from 'http-errors';

import getWebsiteById from '#controllers/website/getWebsiteById.mjs';
import getWebsiteHrefById from '#controllers/websiteHref/getWebsiteHrefById.mjs';
import createWebsiteOperation from '#controllers/websiteOperation/createWebsiteOperation.mjs';
import getWebsiteOperations from '#controllers/websiteOperation/getWebsiteOperations.mjs';
import getWebsiteOperationsByWebsite from '#controllers/websiteOperation/getWebsiteOperationsByWebsite.mjs';

export default {
  '/api/website/href/:websiteHref/click': {
    onPre: async (ctx) => {
      const websiteHrefItem = await getWebsiteHrefById(ctx.request.params.websiteHref);
      if (!websiteHrefItem) {
        throw createError(404);
      }
      ctx.websiteHrefItem = websiteHrefItem;
    },
    post: async (ctx) => {
      const websiteOperationItem = await createWebsiteOperation(
        ctx.websiteHrefItem,
        ctx.request.dateTimeCreate,
      );
      ctx.response = {
        data: websiteOperationItem,
      };
    },
  },
  '/api/website-operations': {
    get: async (ctx) => {
      const websiteOperationList = await getWebsiteOperations();
      ctx.response = {
        data: websiteOperationList,
      };
    },
  },
  '/api/website/:website/operations': {
    onPre: async (ctx) => {
      const websiteItem = await getWebsiteById(ctx.request.params.website);
      if (!websiteItem) {
        throw createError(404);
      }
      ctx.websiteItem = websiteItem;
    },
    post: async (ctx) => {
      const websiteOperationList = await getWebsiteOperationsByWebsite(ctx.websiteItem);
      ctx.response = {
        data: websiteOperationList,
      };
    },
  },
};
