import createError from 'http-errors';

import createCron from '#controllers/cron/createCron.mjs';
import getCronsAtToday from '#controllers/websiteHref/getCronsAtToday.mjs';
import getWebsiteHrefById from '#controllers/websiteHref/getWebsiteHrefById.mjs';
import removeWebsiteHref from '#controllers/websiteHref/removeWebsiteHref.mjs';
import setWebsiteHrefOrder from '#controllers/websiteHref/setWebsiteHrefOrder.mjs';
import setWebsiteHrefOrders from '#controllers/websiteHref/setWebsiteHrefOrders.mjs';
import updateWebsiteHref from '#controllers/websiteHref/updateWebsiteHref.mjs';

const checkoutWebsiteHref = async (ctx) => {
  const websiteHrefItem = await getWebsiteHrefById(ctx.request.params._id);
  if (!websiteHrefItem) {
    throw createError(404);
  }
  ctx.websiteHrefItem = websiteHrefItem;
};

export default {
  '/api/website/href/:_id': {
    onPre: checkoutWebsiteHref,
    get: (ctx) => {
      ctx.response = {
        data: ctx.websiteHrefItem,
      };
    },
    delete: async (ctx) => {
      await removeWebsiteHref(ctx.websiteHrefItem);
      ctx.response = {
        data: ctx.websiteHrefItem,
      };
    },
    put: {
      validate: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            nullable: true,
          },
          protocol: {
            enum: ['http:', 'https:'],
          },
          icon: {
            type: 'string',
            nullable: true,
          },
          pathname: {
            type: 'string',
            nullable: true,
            pattern: '^/',
          },
          querystring: {
            type: 'string',
            nullable: true,
          },
          categories: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          description: {
            type: 'string',
            nullable: true,
          },
        },
        additionalProperties: false,
      },
      fn: async (ctx) => {
        const websiteHrefItemNext = await updateWebsiteHref(ctx.websiteHrefItem, ctx.request.data);
        ctx.response = {
          data: websiteHrefItemNext,
        };
      },
    },
  },
  '/api/website/href/:_id/order': {
    onPre: checkoutWebsiteHref,
    post: async (ctx) => {
      const websiteHrefItemNext = await setWebsiteHrefOrder(ctx.websiteHrefItem);
      ctx.response = {
        data: websiteHrefItemNext,
      };
    },
    delete: async (ctx) => {
      const websiteHrefItemNext = await updateWebsiteHref(ctx.websiteHrefItem, { order: null });
      ctx.response = {
        data: websiteHrefItemNext,
      };
    },
  },
  '/api/website/hrefs/orders': {
    post: {
      validate: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      fn: async (ctx) => {
        const ret = await setWebsiteHrefOrders(ctx.request.data);
        ctx.response = {
          data: ret,
        };
      },
    },
  },
  '/api/website/href/today/crons': {
    get: async (ctx) => {
      const cronList = await getCronsAtToday();
      ctx.response = {
        data: cronList,
      };
    },
  },
  '/api/website/href/:_id/cron': {
    onPre: checkoutWebsiteHref,
    post: {
      validate: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            minLength: 8,
            not: {
              pattern: '^\\s+$',
            },
          },
          isOnce: {
            type: 'boolean',
            nullable: true,
          },
          description: {
            type: 'string',
            nullable: true,
          },
        },
        required: ['value'],
        additionalProperties: false,
      },
      fn: async (ctx) => {
        const cronItem = await createCron(ctx.request.data);
        const websiteHrefItemNext = await updateWebsiteHref(ctx.websiteHrefItem, {
          crons: [...ctx.websiteHrefItem.crons || [], cronItem._id],
        });
        ctx.response = {
          data: websiteHrefItemNext,
        };
      },
    },
  },
};
