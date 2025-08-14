import createError from 'http-errors';

import createWebsite from '#controllers/website/createWebsite.mjs';
import getWebsiteById from '#controllers/website/getWebsiteById.mjs';
import getWebsites from '#controllers/website/getWebsites.mjs';
import removeWebsite from '#controllers/website/removeWebsite.mjs';
import setWebsitesOrders from '#controllers/website/setWebsitesOrders.mjs';
import updateWebsite from '#controllers/website/updateWebsite.mjs';

export default {
  '/api/websites': {
    get: async (ctx) => {
      const websiteList = await getWebsites();

      ctx.response = {
        data: websiteList,
      };
    },
  },
  '/api/websites/orders': {
    post: {
      validate: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      fn: async (ctx) => {
        const ret = await setWebsitesOrders(ctx.request.data);
        ctx.response = {
          data: ret,
        };
      },
    },
  },
  '/api/website': {
    post: {
      validate: {
        type: 'object',
        properties: {
          href: {
            type: 'string',
            minLength: 1,
            not: {
              pattern: '^\\s+$',
            },
          },
          categories: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          name: {
            type: 'string',
            nullable: true,
          },
          icon: {
            type: 'string',
            nullable: true,
          },
          description: {
            type: 'string',
            nullable: true,
          },
        },
        required: ['href'],
        additionalProperties: false,
      },
      fn: async (ctx) => {
        const websiteItem = await createWebsite(ctx.request.data);
        ctx.response = {
          data: websiteItem,
        };
      },
    },
  },
  '/api/website/:_id': {
    onPre: async (ctx) => {
      const websiteItem = await getWebsiteById(ctx.request.params._id);
      if (!websiteItem) {
        throw createError(404);
      }
      ctx.websiteItem = websiteItem;
    },
    put: {
      validate: {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
            nullable: true,
          },
          hostname: {
            type: 'string',
            minLength: 1,
            not: {
              pattern: '^\\s+$',
            },
          },
          name: {
            type: 'string',
            nullable: true,
          },
          icon: {
            type: 'string',
            nullable: true,
          },
          description: {
            type: 'string',
            nullable: true,
          },
        },
        additionalProperties: false,
      },
      fn: async (ctx) => {
        const websiteItemNext = await updateWebsite(ctx.websiteItem, ctx.request.data);
        ctx.response = {
          data: websiteItemNext,
        };
      },
    },
    delete: async (ctx) => {
      await removeWebsite(ctx.websiteItem);
      ctx.response = {
        data: ctx.websiteItem,
      };
    },
    get: (ctx) => {
      ctx.response = {
        data: ctx.websiteItem,
      };
    },
  },
};
